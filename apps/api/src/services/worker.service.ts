import { Paper } from '../models/Paper.js';
import { Question } from '../models/Question.js';
import { Topic } from '../models/Topic.js';
import { Unit } from '../models/Unit.js';
import { ProcessingJob, IProcessingJobDocument } from '../models/ProcessingJob.js';
import { storageProvider } from './storage.service.js';
import { mlClient } from './ml.service.js';
import { recalculateTopicImportance } from './importance.service.js';
import { config } from '../config/index.js';

export class BackgroundWorker {
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Worker] Persistent MongoDB background worker started (concurrency: 1).');
    this.pollLoop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log('[Worker] Background worker stopped.');
  }

  private async pollLoop(): Promise<void> {
    if (!this.isRunning) return;
    try {
      await this.processNextJob();
    } catch (err) {
      console.error('[Worker] Unexpected error in worker loop:', err);
    } finally {
      if (this.isRunning) {
        this.timer = setTimeout(() => this.pollLoop(), config.worker.pollIntervalMs);
      }
    }
  }

  async processNextJob(): Promise<void> {
    // 1. Recover stale jobs (worker crashes / restarts)
    const staleThreshold = new Date(Date.now() - config.worker.lockTimeoutMs);
    await ProcessingJob.updateMany(
      { status: 'PROCESSING', lockedAt: { $lt: staleThreshold } },
      { $set: { status: 'QUEUED', lockedAt: undefined } }
    );

    // 2. Atomically claim one job
    const job = await ProcessingJob.findOneAndUpdate(
      { status: 'QUEUED' },
      { 
        $set: { 
          status: 'PROCESSING', 
          lockedAt: new Date(), 
          startedAt: new Date() 
        },
        $inc: { attempts: 1 }
      },
      { sort: { createdAt: 1 }, new: true }
    );

    if (!job) return; // No jobs queued

    console.log(`[Worker] Claimed job ${job._id} (type: ${job.jobType})`);

    try {
      if (job.jobType === 'PDF_EXTRACTION') {
        await this.handlePdfExtraction(job);
      } else if (job.jobType === 'ANALYTICS_RECALCULATION' && job.subjectId) {
        await recalculateTopicImportance(job.subjectId.toString());
      }

      job.status = 'COMPLETED';
      job.progress = 100;
      job.completedAt = new Date();
      await job.save();
      console.log(`[Worker] Job ${job._id} completed successfully.`);
    } catch (err: any) {
      console.error(`[Worker] Job ${job._id} failed:`, err.message);
      job.lastError = err.message || 'Unknown processing error';
      if (job.attempts >= config.worker.maxAttempts) {
        job.status = 'FAILED';
        if (job.paperId) {
          await Paper.findByIdAndUpdate(job.paperId, { processingStatus: 'FAILED' });
        }
      } else {
        job.status = 'QUEUED'; // Retry
      }
      await job.save();
    }
  }

  private async handlePdfExtraction(job: IProcessingJobDocument): Promise<void> {
    if (!job.paperId) throw new Error('Job missing paperId');
    const paper = await Paper.findById(job.paperId);
    if (!paper) throw new Error(`Paper ${job.paperId} not found`);

    paper.processingStatus = 'PROCESSING';
    await paper.save();

    const filePath = storageProvider.getFilePath(paper.storageKey);

    // 1. Extract questions via ML Service
    job.progress = 30;
    await job.save();
    const extractRes = await mlClient.extractQuestions(filePath);

    // Delete existing questions for this paper (idempotency)
    await Question.deleteMany({ paperId: paper._id });

    // 2. Retrieve syllabus topics for subject
    job.progress = 60;
    await job.save();
    const units = await Unit.find({ subjectId: paper.subjectId }).lean();
    const unitIds = units.map(u => u._id);
    const topics = await Topic.find({ unitId: { $in: unitIds }, isActive: true }).lean();

    const formattedTopics = topics.map(t => ({
      id: t._id.toString(),
      name: t.name,
      keywords: t.keywords,
      description: t.description || ''
    }));

    // 3. Map topics via TF-IDF + Cosine Similarity
    const mappedRes = await mlClient.mapTopics(extractRes.questions, formattedTopics, 0.15);

    // 4. Save Questions to DB
    const questionDocs = mappedRes.mapped_questions.map(q => ({
      paperId: paper._id,
      questionNumber: q.question_number,
      subQuestionNumber: q.sub_question_number,
      pageNumber: q.page_number,
      originalText: q.original_text,
      normalisedText: q.normalised_text,
      marks: q.marks || 10,
      topicId: q.topic_id || undefined,
      mappingConfidence: q.mapping_confidence || 0,
      mappingStatus: q.mapping_status || 'UNMAPPED',
      extractionConfidence: 1.0
    }));

    if (questionDocs.length > 0) {
      await Question.insertMany(questionDocs);
    }

    paper.processingStatus = 'COMPLETED';
    await paper.save();

    // 5. Recalculate subject analytics
    job.progress = 85;
    await job.save();
    await recalculateTopicImportance(paper.subjectId.toString());
  }
}

export const backgroundWorker = new BackgroundWorker();
