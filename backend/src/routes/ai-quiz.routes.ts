// ai-quiz.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { aiQuizController } from '../controllers/ai-quiz.controller';

const router = express.Router();

router.post('/start', authenticate, aiQuizController.startQuiz);
router.post('/submit', authenticate, aiQuizController.submitAnswer);
router.get('/progress/:threadId', authenticate, aiQuizController.getProgress);

export const aiQuizRoutes = router;