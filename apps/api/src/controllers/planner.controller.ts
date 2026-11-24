import { Request, Response } from 'express';
import { StudyPlan } from '../models/StudyPlan.js';
import { Progress } from '../models/Progress.js';
import { generateStudySchedule } from '../services/planner.service.js';

export async function getStudyPlan(req: Request, res: Response): Promise<void> {
  const plan = await StudyPlan.findOne({
    userId: req.user!.userId,
    subjectId: req.params.subjectId
  });
  if (!plan) {
    res.status(404).json({ success: false, error: 'No study plan found for this subject' });
    return;
  }
  res.json({ success: true, data: plan });
}

export async function createOrUpdateStudyPlan(req: Request, res: Response): Promise<void> {
  const { subjectId, examDate, dailyHours, weakTopicIds, completedTopicIds, unavailableDates } = req.body;

  const schedule = await generateStudySchedule({
    subjectId,
    examDateStr: examDate,
    dailyHours,
    weakTopicIds: weakTopicIds || [],
    completedTopicIds: completedTopicIds || [],
    unavailableDates: unavailableDates || []
  });

  const plan = await StudyPlan.findOneAndUpdate(
    { userId: req.user!.userId, subjectId },
    {
      examDate: new Date(examDate),
      dailyHours,
      schedule,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true, data: plan });
}

export async function toggleTaskCompletion(req: Request, res: Response): Promise<void> {
  const { planId, taskIndex } = req.params;
  const plan = await StudyPlan.findOne({ _id: planId, userId: req.user!.userId });
  if (!plan) {
    res.status(404).json({ success: false, error: 'Study plan not found' });
    return;
  }

  const idx = parseInt(taskIndex, 10);
  if (idx < 0 || idx >= plan.schedule.length) {
    res.status(400).json({ success: false, error: 'Invalid task index' });
    return;
  }

  plan.schedule[idx].completed = !plan.schedule[idx].completed;
  await plan.save();

  res.json({ success: true, data: plan });
}

export async function getProgress(req: Request, res: Response): Promise<void> {
  const progress = await Progress.find({ userId: req.user!.userId });
  res.json({ success: true, data: progress });
}

export async function updateTopicProgress(req: Request, res: Response): Promise<void> {
  const { topicId, status, notes } = req.body;
  const progress = await Progress.findOneAndUpdate(
    { userId: req.user!.userId, topicId },
    {
      status,
      notes,
      completedAt: status === 'COMPLETED' ? new Date() : undefined
    },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: progress });
}
