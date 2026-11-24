import { Request, Response } from 'express';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Topic } from '../models/Topic.js';
import { AuditLog } from '../models/AuditLog.js';

// Subjects
export async function getSubjects(req: Request, res: Response): Promise<void> {
  const { semester, branch, search } = req.query;
  const filter: any = { isActive: true };
  if (semester) filter.semester = parseInt(semester as string, 10);
  if (branch) filter.branch = branch;
  if (search) filter.name = { $regex: search as string, $options: 'i' };

  const subjects = await Subject.find(filter).sort({ semester: 1, code: 1 });
  res.json({ success: true, data: subjects });
}

export async function getSubjectById(req: Request, res: Response): Promise<void> {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404).json({ success: false, error: 'Subject not found' });
    return;
  }
  res.json({ success: true, data: subject });
}

export async function createSubject(req: Request, res: Response): Promise<void> {
  const subject = await Subject.create(req.body);
  if (req.user) {
    await AuditLog.create({
      actorId: req.user.userId,
      action: 'CREATE_SUBJECT',
      entityType: 'Subject',
      entityId: subject._id.toString(),
      metadata: req.body
    });
  }
  res.status(201).json({ success: true, data: subject });
}

// Units
export async function getUnitsBySubject(req: Request, res: Response): Promise<void> {
  const units = await Unit.find({ subjectId: req.params.subjectId }).sort({ unitNo: 1 });
  res.json({ success: true, data: units });
}

export async function createUnit(req: Request, res: Response): Promise<void> {
  const unit = await Unit.create(req.body);
  res.status(201).json({ success: true, data: unit });
}

// Topics
export async function getTopicsByUnit(req: Request, res: Response): Promise<void> {
  const topics = await Topic.find({ unitId: req.params.unitId, isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: topics });
}

export async function createTopic(req: Request, res: Response): Promise<void> {
  const topic = await Topic.create(req.body);
  res.status(201).json({ success: true, data: topic });
}

// Full Syllabus Tree
export async function getSubjectSyllabus(req: Request, res: Response): Promise<void> {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404).json({ success: false, error: 'Subject not found' });
    return;
  }

  const units = await Unit.find({ subjectId: subject._id }).sort({ unitNo: 1 }).lean();
  const unitIds = units.map(u => u._id);
  const topics = await Topic.find({ unitId: { $in: unitIds }, isActive: true }).lean();

  const syllabusTree = units.map(unit => ({
    ...unit,
    topics: topics.filter(t => t.unitId.toString() === unit._id.toString())
  }));

  res.json({
    success: true,
    data: {
      subject,
      units: syllabusTree
    }
  });
}
