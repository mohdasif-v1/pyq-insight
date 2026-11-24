import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['STUDENT', 'ADMIN']).default('STUDENT')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100)
});

export const CreateSubjectSchema = z.object({
  university: z.string().default('AKTU'),
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(120),
  branch: z.string().default('CSE'),
  semester: z.number().int().min(1).max(8),
  syllabusVersion: z.string().default('2022-23')
});

export const CreateUnitSchema = z.object({
  subjectId: z.string().min(1),
  unitNo: z.number().int().min(1).max(10),
  title: z.string().min(2).max(150),
  description: z.string().optional()
});

export const CreateTopicSchema = z.object({
  unitId: z.string().min(1),
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  keywords: z.array(z.string().min(1)).min(1, 'At least one keyword required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM')
});

export const UploadPaperMetadataSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  year: z.coerce.number().int().min(2010).max(2035),
  session: z.enum(['REGULAR', 'CARRY_OVER', 'SPECIAL']).default('REGULAR'),
  examType: z.string().default('Semester Exam'),
  totalMarks: z.coerce.number().int().min(10).max(200).default(100)
});

export const TopicMappingReviewSchema = z.object({
  topicId: z.string().min(1, 'Target topic ID is required'),
  action: z.enum(['VERIFY', 'REASSIGN'])
});

export const GenerateStudyPlanSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Exam date must be YYYY-MM-DD'),
  dailyHours: z.number().min(0.5).max(16).default(3),
  weakTopicIds: z.array(z.string()).default([]),
  completedTopicIds: z.array(z.string()).default([]),
  unavailableDates: z.array(z.string()).default([])
});

export const UpdateProgressSchema = z.object({
  topicId: z.string().min(1),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'WEAK', 'COMPLETED']),
  notes: z.string().max(1000).optional()
});

export const PracticeAttemptSchema = z.object({
  questionId: z.string().min(1),
  status: z.enum(['ATTEMPTED', 'WEAK', 'MASTERED'])
});
