import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { resumeController } from '../controllers/resume.controller';

const router = express.Router();

router.post('/analyze', authenticate, resumeController.analyzeResume);

export const resumeRoutes = router;