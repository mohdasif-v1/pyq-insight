import { Request, Response } from 'express';
import { Paper } from '../models/Paper.js';
import { ProcessingJob } from '../models/ProcessingJob.js';
import { Question } from '../models/Question.js';
import { storageProvider } from '../services/storage.service.js';
import { AuditLog } from '../models/AuditLog.js';

export async function uploadPaper(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'PDF file is required' });
    return;
  }

  // Validate PDF magic bytes (%PDF-)
  const magicBytes = req.file.buffer.subarray(0, 5).toString('ascii');
  if (!magicBytes.startsWith('%PDF-')) {
    res.status(400).json({ success: false, error: 'Uploaded file is not a valid PDF document' });
    return;
  }

  const { subjectId, year, session, examType, totalMarks } = req.body;

  // Save via Storage Provider
  const { storageKey, fileHash } = await storageProvider.save(req.file.buffer, req.file.originalname);

  // Check duplicate hash
  const existing = await Paper.findOne({ subjectId, fileHash });
  if (existing) {
    // Remove newly uploaded file copy
    await storageProvider.delete(storageKey);
    res.status(409).json({ success: false, error: 'This exact paper has already been uploaded for this subject' });
    return;
  }

  const paper = await Paper.create({
    subjectId,
    year: parseInt(year, 10),
    session: session || 'REGULAR',
    examType: examType || 'Semester Exam',
    totalMarks: parseInt(totalMarks, 10) || 100,
    storageKey,
    originalFilename: req.file.originalname,
    fileHash,
    processingStatus: 'QUEUED',
    uploadedBy: req.user!.userId
  });

  // Enqueue Persistent Processing Job
  const job = await ProcessingJob.create({
    paperId: paper._id,
    subjectId: paper.subjectId,
    jobType: 'PDF_EXTRACTION',
    status: 'QUEUED',
    attempts: 0,
    progress: 0
  });

  await AuditLog.create({
    actorId: req.user!.userId,
    action: 'UPLOAD_PAPER',
    entityType: 'Paper',
    entityId: paper._id.toString(),
    metadata: { filename: req.file.originalname, year, session }
  });

  res.status(201).json({
    success: true,
    data: {
      paper,
      job
    }
  });
}

export async function getPapers(req: Request, res: Response): Promise<void> {
  const { subjectId, year, status } = req.query;
  const filter: any = {};
  if (subjectId) filter.subjectId = subjectId;
  if (year) filter.year = parseInt(year as string, 10);
  if (status) filter.processingStatus = status;

  const papers = await Paper.find(filter).sort({ year: -1, createdAt: -1 });
  res.json({ success: true, data: papers });
}

export async function getPaperById(req: Request, res: Response): Promise<void> {
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    res.status(404).json({ success: false, error: 'Paper not found' });
    return;
  }
  const questions = await Question.find({ paperId: paper._id }).sort({ questionNumber: 1 });
  res.json({ success: true, data: { paper, questions } });
}

export async function reprocessPaper(req: Request, res: Response): Promise<void> {
  const paper = await Paper.findById(req.params.id);
  if (!paper) {
    res.status(404).json({ success: false, error: 'Paper not found' });
    return;
  }

  paper.processingStatus = 'QUEUED';
  await paper.save();

  const job = await ProcessingJob.create({
    paperId: paper._id,
    subjectId: paper.subjectId,
    jobType: 'PDF_EXTRACTION',
    status: 'QUEUED',
    attempts: 0,
    progress: 0
  });

  res.json({ success: true, data: { paper, job } });
}
