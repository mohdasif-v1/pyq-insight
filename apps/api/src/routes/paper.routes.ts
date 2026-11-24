import { Router } from 'express';
import multer from 'multer';
import { uploadPaper, getPapers, getPaperById, reprocessPaper } from '../controllers/paper.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { UploadPaperMetadataSchema } from '@pyq/shared-validation';
import { config } from '../config/index.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.storage.maxFileSizeMb * 1024 * 1024 // 15MB default
  }
});

const router = Router();

router.get('/', authenticate, getPapers);
router.get('/:id', authenticate, getPaperById);
router.post('/', authenticate, requireRole('ADMIN'), upload.single('file'), validateBody(UploadPaperMetadataSchema), uploadPaper);
router.post('/:id/reprocess', authenticate, requireRole('ADMIN'), reprocessPaper);

export default router;
