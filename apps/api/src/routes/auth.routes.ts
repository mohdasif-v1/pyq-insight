import { Router } from 'express';
import { register, login, refresh, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.js';
import { RegisterSchema, LoginSchema } from '@pyq/shared-validation';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', validateBody(RegisterSchema), register);
router.post('/login', validateBody(LoginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
