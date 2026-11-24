import { Router } from 'express';
import { 
  getReviewQueue, 
  reviewQuestionMapping, 
  recalculateSubjectClusters, 
  getSubjectClusters 
} from '../controllers/review.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { TopicMappingReviewSchema } from '@pyq/shared-validation';

const router = Router();

router.get('/review-queue', authenticate, requireRole('ADMIN'), getReviewQueue);
router.post('/questions/:id/review', authenticate, requireRole('ADMIN'), validateBody(TopicMappingReviewSchema), reviewQuestionMapping);
router.post('/clusters/subjects/:subjectId/recalculate', authenticate, requireRole('ADMIN'), recalculateSubjectClusters);
router.get('/clusters/subjects/:subjectId', authenticate, getSubjectClusters);

export default router;
