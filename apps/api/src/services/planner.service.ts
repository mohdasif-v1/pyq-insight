import { IStudyTask } from '@pyq/shared-types';
import { Topic } from '../models/Topic.js';
import { Unit } from '../models/Unit.js';
import { TopicScore } from '../models/TopicScore.js';

export interface GeneratePlanOptions {
  subjectId: string;
  examDateStr: string;
  dailyHours: number;
  weakTopicIds: string[];
  completedTopicIds: string[];
  unavailableDates?: string[];
}

/**
 * Greedy Study Scheduler:
 * TopicPriority = TopicScore * (1 + WeaknessFactor)
 * Allocates available study days before examDate, reserving the final day for revision.
 */
export async function generateStudySchedule(options: GeneratePlanOptions): Promise<IStudyTask[]> {
  const { subjectId, examDateStr, dailyHours, weakTopicIds, completedTopicIds, unavailableDates = [] } = options;

  const examDate = new Date(examDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) {
    throw new Error('Examination date must be at least 1 day in the future');
  }

  // Load units and topics
  const units = await Unit.find({ subjectId }).lean();
  const unitMap = new Map(units.map(u => [u._id.toString(), u.unitNo]));
  const unitIds = units.map(u => u._id);

  const topics = await Topic.find({ unitId: { $in: unitIds }, isActive: true }).lean();
  const scores = await TopicScore.find({ subjectId }).lean();
  const scoreMap = new Map(scores.map(s => [s.topicId.toString(), s.finalScore]));

  // Filter out already completed topics
  const eligibleTopics = topics.filter(t => !completedTopicIds.includes(t._id.toString()));
  if (eligibleTopics.length === 0) {
    // If all completed, include all topics for revision
    eligibleTopics.push(...topics);
  }

  // Compute TopicPriority
  const prioritized = eligibleTopics.map(topic => {
    const tid = topic._id.toString();
    const baseScore = scoreMap.get(tid) || 20; // Default baseline if uncalculated
    const isWeak = weakTopicIds.includes(tid);
    const weaknessFactor = isWeak ? 0.5 : 0; // 50% priority boost for weak topics
    const priority = baseScore * (1 + weaknessFactor);

    return {
      topicId: topic._id,
      topicName: topic.name,
      unitNo: unitMap.get(topic.unitId.toString()) || 1,
      priority,
      isWeak
    };
  });

  // Sort descending by priority
  prioritized.sort((a, b) => b.priority - a.priority);

  // Build calendar days
  const availableDays: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];
    if (!unavailableDates.includes(dateStr)) {
      availableDays.push(dateStr);
    }
  }

  if (availableDays.length === 0) {
    throw new Error('No study days available after applying unavailable dates');
  }

  const tasks: IStudyTask[] = [];
  const durationMinutes = Math.min(dailyHours * 60, 480); // Cap at 8 hours max per day

  // Reserve the last available day for Comprehensive Revision if totalDays >= 3
  const hasDedicatedRevision = availableDays.length >= 3;
  const learningDays = hasDedicatedRevision ? availableDays.slice(0, availableDays.length - 1) : availableDays;
  const lastDay = availableDays[availableDays.length - 1];

  let topicIndex = 0;
  for (const date of learningDays) {
    const currentTopic = prioritized[topicIndex % prioritized.length];
    tasks.push({
      date,
      topicId: currentTopic.topicId.toString(),
      topicName: currentTopic.topicName,
      unitNo: currentTopic.unitNo,
      durationMinutes,
      taskType: currentTopic.isWeak ? 'PRACTICE' : 'NEW_LEARNING',
      completed: false
    });
    topicIndex++;
  }

  if (hasDedicatedRevision) {
    const topTopic = prioritized[0];
    tasks.push({
      date: lastDay,
      topicId: topTopic.topicId.toString(),
      topicName: `Comprehensive Final Revision (${topTopic.topicName} & High Priority)`,
      unitNo: topTopic.unitNo,
      durationMinutes,
      taskType: 'REVISION',
      completed: false
    });
  }

  return tasks;
}
