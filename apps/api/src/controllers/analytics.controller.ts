import { Request, Response } from 'express';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Topic } from '../models/Topic.js';
import { Paper } from '../models/Paper.js';
import { Question } from '../models/Question.js';
import { TopicScore } from '../models/TopicScore.js';
import { User } from '../models/User.js';
import { ProcessingJob } from '../models/ProcessingJob.js';

export async function getSubjectAnalytics(req: Request, res: Response): Promise<void> {
  const { subjectId } = req.params;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    res.status(404).json({ success: false, error: 'Subject not found' });
    return;
  }

  const units = await Unit.find({ subjectId }).sort({ unitNo: 1 }).lean();
  const unitIds = units.map(u => u._id);
  const topics = await Topic.find({ unitId: { $in: unitIds } }).lean();
  const topicIds = topics.map(t => t._id);

  const scores = await TopicScore.find({ subjectId }).lean();
  const scoreMap = new Map(scores.map(s => [s.topicId.toString(), s]));

  // Topic Importance Heatmap list
  const heatmap = topics.map(topic => {
    const score = scoreMap.get(topic._id.toString());
    const unit = units.find(u => u._id.toString() === topic.unitId.toString());
    return {
      topicId: topic._id,
      topicName: topic.name,
      unitNo: unit ? unit.unitNo : 1,
      unitTitle: unit ? unit.title : '',
      finalScore: score ? score.finalScore : 0,
      category: score ? score.category : 'LOW',
      frequency: score ? score.frequency : 0,
      recency: score ? score.recency : 0,
      marksWeight: score ? score.marksWeight : 0
    };
  }).sort((a, b) => b.finalScore - a.finalScore);

  // Unit-wise Marks Distribution
  const papers = await Paper.find({ subjectId, processingStatus: 'COMPLETED' }).lean();
  const paperIds = papers.map(p => p._id);
  const questions = await Question.find({ paperId: { $in: paperIds }, topicId: { $in: topicIds } }).lean();

  const topicToUnitMap = new Map(topics.map(t => [t._id.toString(), t.unitId.toString()]));
  const unitMarksMap = new Map<string, number>();

  for (const q of questions) {
    if (q.topicId) {
      const uId = topicToUnitMap.get(q.topicId.toString());
      if (uId) {
        const current = unitMarksMap.get(uId) || 0;
        unitMarksMap.set(uId, current + (q.marks || 10));
      }
    }
  }

  const unitDistribution = units.map(u => ({
    unitNo: u.unitNo,
    title: u.title,
    totalMarks: unitMarksMap.get(u._id.toString()) || 0
  }));

  // Year-wise question trends
  const yearTrendsMap = new Map<number, number>();
  for (const p of papers) {
    const pQuestions = questions.filter(q => q.paperId.toString() === p._id.toString());
    const existing = yearTrendsMap.get(p.year) || 0;
    yearTrendsMap.set(p.year, existing + pQuestions.length);
  }

  const yearTrends = Array.from(yearTrendsMap.entries())
    .map(([year, count]) => ({ year, questionCount: count }))
    .sort((a, b) => a.year - b.year);

  res.json({
    success: true,
    data: {
      subject,
      papersAnalyzed: papers.length,
      totalQuestions: questions.length,
      heatmap,
      unitDistribution,
      yearTrends
    }
  });
}

export async function getAdminSystemStats(req: Request, res: Response): Promise<void> {
  const [totalUsers, totalSubjects, totalPapers, totalQuestions, pendingReviews, activeJobs] = await Promise.all([
    User.countDocuments(),
    Subject.countDocuments(),
    Paper.countDocuments(),
    Question.countDocuments(),
    Question.countDocuments({ mappingStatus: 'REVIEW_REQUIRED' }),
    ProcessingJob.countDocuments({ status: { $in: ['QUEUED', 'PROCESSING'] } })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalSubjects,
      totalPapers,
      totalQuestions,
      pendingReviews,
      activeJobs
    }
  });
}
