import { Request, Response } from 'express';
import { Question } from '../models/Question.js';
import { Topic } from '../models/Topic.js';
import { Cluster } from '../models/Cluster.js';
import { AuditLog } from '../models/AuditLog.js';
import { mlClient } from '../services/ml.service.js';
import { recalculateTopicImportance } from '../services/importance.service.js';

export async function getReviewQueue(req: Request, res: Response): Promise<void> {
  const { subjectId } = req.query;
  const questions = await Question.find({ mappingStatus: 'REVIEW_REQUIRED' })
    .populate('paperId', 'subjectId year session')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ success: true, data: questions });
}

export async function reviewQuestionMapping(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { topicId, action } = req.body;

  const question = await Question.findById(id);
  if (!question) {
    res.status(404).json({ success: false, error: 'Question not found' });
    return;
  }

  const topic = await Topic.findById(topicId);
  if (!topic) {
    res.status(404).json({ success: false, error: 'Target topic not found' });
    return;
  }

  question.topicId = topic._id;
  question.mappingStatus = 'ADMIN_VERIFIED';
  await question.save();

  await AuditLog.create({
    actorId: req.user!.userId,
    action: 'REVIEW_QUESTION_MAPPING',
    entityType: 'Question',
    entityId: question._id.toString(),
    metadata: { assignedTopicId: topicId, action }
  });

  res.json({ success: true, data: question });
}

export async function recalculateSubjectClusters(req: Request, res: Response): Promise<void> {
  const { subjectId } = req.params;

  const questions = await Question.find({ topicId: { $ne: null } })
    .populate({
      path: 'paperId',
      match: { subjectId }
    })
    .lean();

  const filtered = questions.filter(q => q.paperId != null);
  if (filtered.length < 2) {
    res.status(400).json({ success: false, error: 'Not enough questions to perform clustering' });
    return;
  }

  const formatted = filtered.map(q => ({
    id: q._id.toString(),
    question_number: q.questionNumber,
    original_text: q.originalText,
    normalised_text: q.normalisedText,
    year: (q.paperId as any).year
  }));

  const clusterRes = await mlClient.clusterQuestions(formatted, 0.6);

  // Clear previous clusters for subject
  await Cluster.deleteMany({ subjectId });

  const clusterDocs = clusterRes.clusters.map(c => ({
    subjectId,
    representativeQuestionId: c.representative_question_id,
    questionIds: c.member_question_ids,
    algorithm: 'AgglomerativeClustering',
    calculationVersion: '1.0'
  }));

  if (clusterDocs.length > 0) {
    await Cluster.insertMany(clusterDocs);
  }

  // Also trigger importance score recalculation
  await recalculateTopicImportance(subjectId);

  res.json({ success: true, data: { clustersCreated: clusterDocs.length, clusters: clusterDocs } });
}

export async function getSubjectClusters(req: Request, res: Response): Promise<void> {
  const { subjectId } = req.params;
  const clusters = await Cluster.find({ subjectId })
    .populate('representativeQuestionId')
    .populate('questionIds');

  res.json({ success: true, data: clusters });
}
