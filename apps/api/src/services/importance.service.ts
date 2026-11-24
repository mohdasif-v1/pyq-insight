import { Topic } from '../models/Topic.js';
import { Unit } from '../models/Unit.js';
import { Paper } from '../models/Paper.js';
import { Question } from '../models/Question.js';
import { TopicScore } from '../models/TopicScore.js';

export interface ScoreWeights {
  frequency: number;
  recency: number;
  marksWeight: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  frequency: 0.4,
  recency: 0.3,
  marksWeight: 0.3
};

/**
 * Calculates topic importance according to Section 5.4.5:
 * Score(topic) = w1 * Frequency + w2 * Recency + w3 * MarksWeight
 * where:
 * - Frequency = count(questions for topic) / total_eligible_questions
 * - Recency = sum( 1 / (1 + age_of_paper) ) for relevant papers
 * - MarksWeight = sum(marks for topic) / total_marks
 * All components normalized 0 to 1, weighted sum presented as a percentage.
 */
export async function recalculateTopicImportance(
  subjectId: string, 
  weights: ScoreWeights = DEFAULT_WEIGHTS
): Promise<void> {
  const units = await Unit.find({ subjectId }).lean();
  const unitIds = units.map(u => u._id);
  const topics = await Topic.find({ unitId: { $in: unitIds }, isActive: true }).lean();
  const papers = await Paper.find({ subjectId, processingStatus: 'COMPLETED' }).lean();

  if (topics.length === 0 || papers.length === 0) {
    return;
  }

  const paperMap = new Map(papers.map(p => [p._id.toString(), p]));
  const paperIds = papers.map(p => p._id);
  const currentYear = new Date().getFullYear();

  const questions = await Question.find({
    paperId: { $in: paperIds },
    topicId: { $ne: null }
  }).lean();

  const totalQuestions = questions.length || 1;
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 10), 0) || 1;

  // Compute raw values for each topic
  const topicStats = topics.map(topic => {
    const topicQuestions = questions.filter(q => q.topicId && q.topicId.toString() === topic._id.toString());
    const qCount = topicQuestions.length;
    const marksSum = topicQuestions.reduce((sum, q) => sum + (q.marks || 10), 0);

    let rawRecency = 0;
    for (const q of topicQuestions) {
      const paper = paperMap.get(q.paperId.toString());
      if (paper && paper.year) {
        const age = Math.max(0, currentYear - paper.year);
        rawRecency += 1.0 / (1.0 + age);
      }
    }

    const rawFreq = qCount / totalQuestions;
    const rawMarks = marksSum / totalMarks;

    return {
      topicId: topic._id,
      rawFreq,
      rawRecency,
      rawMarks
    };
  });

  // Normalization bounds across the subject
  const maxFreq = Math.max(...topicStats.map(s => s.rawFreq), 0.0001);
  const maxRecency = Math.max(...topicStats.map(s => s.rawRecency), 0.0001);
  const maxMarks = Math.max(...topicStats.map(s => s.rawMarks), 0.0001);

  // Upsert TopicScore records
  for (const stat of topicStats) {
    const normFreq = stat.rawFreq / maxFreq;
    const normRecency = stat.rawRecency / maxRecency;
    const normMarks = stat.rawMarks / maxMarks;

    const rawScore = (weights.frequency * normFreq) + (weights.recency * normRecency) + (weights.marksWeight * normMarks);
    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore * 100)));

    let category: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (finalScore >= 60) category = 'HIGH';
    else if (finalScore >= 35) category = 'MEDIUM';

    await TopicScore.findOneAndUpdate(
      { subjectId, topicId: stat.topicId },
      {
        frequency: Math.round(normFreq * 100) / 100,
        recency: Math.round(normRecency * 100) / 100,
        marksWeight: Math.round(normMarks * 100) / 100,
        finalScore,
        category,
        calculationVersion: '1.0',
        calculatedAt: new Date()
      },
      { upsert: true, new: true }
    );
  }
}
