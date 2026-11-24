import { Router } from 'express';
import { 
  getSubjects, 
  getSubjectById, 
  createSubject, 
  getUnitsBySubject, 
  createUnit, 
  getTopicsByUnit, 
  createTopic,
  getSubjectSyllabus
} from '../controllers/catalogue.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { CreateSubjectSchema, CreateUnitSchema, CreateTopicSchema } from '@pyq/shared-validation';

const router = Router();

// Public / Student accessible routes
router.get('/subjects', authenticate, getSubjects);
router.get('/subjects/:id', authenticate, getSubjectById);
router.get('/subjects/:id/syllabus', authenticate, getSubjectSyllabus);
router.get('/subjects/:subjectId/units', authenticate, getUnitsBySubject);
router.get('/units/:unitId/topics', authenticate, getTopicsByUnit);

// Admin-only management routes
router.post('/subjects', authenticate, requireRole('ADMIN'), validateBody(CreateSubjectSchema), createSubject);
router.post('/units', authenticate, requireRole('ADMIN'), validateBody(CreateUnitSchema), createUnit);
router.post('/topics', authenticate, requireRole('ADMIN'), validateBody(CreateTopicSchema), createTopic);

export default router;
