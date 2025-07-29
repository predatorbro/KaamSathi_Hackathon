// ai-chatbot.routes.ts
import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { aiChatbotController } from '../controllers/ai-chatbot.controller';

const router = express.Router();

// Start a new chat session
router.post('/start', authenticate, aiChatbotController.startChat);

// Send a message and get response
router.post('/send', authenticate, aiChatbotController.sendMessage);

// Get chat history
router.get('/history/:threadId', authenticate, aiChatbotController.getChatHistory);

// Clear chat history
router.delete('/clear/:threadId', authenticate, aiChatbotController.clearChat);

export const aiChatbotRoutes = router;