import { Router } from 'express';
import { getSubjectAnalytics, getAdminSystemStats } from '../controllers/analytics.controller.js';
import { 
  getStudyPlan, 
  createOrUpdateStudyPlan, 
  toggleTaskCompletion, 
  getProgress, 
  updateTopicProgress 
} from '../controllers/planner.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { GenerateStudyPlanSchema, UpdateProgressSchema } from '@pyq/shared-validation';

export const analyticsRouter = Router();
analyticsRouter.get('/subjects/:subjectId', authenticate, getSubjectAnalytics);
analyticsRouter.get('/admin/stats', authenticate, requireRole('ADMIN'), getAdminSystemStats);

export const studyPlanRouter = Router();
studyPlanRouter.get('/subjects/:subjectId', authenticate, getStudyPlan);
studyPlanRouter.post('/', authenticate, validateBody(GenerateStudyPlanSchema), createOrUpdateStudyPlan);
studyPlanRouter.patch('/:planId/tasks/:taskIndex/toggle', authenticate, toggleTaskCompletion);

export const progressRouter = Router();
progressRouter.get('/', authenticate, getProgress);
progressRouter.post('/', authenticate, validateBody(UpdateProgressSchema), updateTopicProgress);
