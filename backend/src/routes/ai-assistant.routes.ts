import { Router } from 'express';
import { aiAssistantController } from '../controllers/ai-assistant.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Chat with AI assistant
router.post('/chat', aiAssistantController.chat);

// Clear conversation history
router.delete('/history', aiAssistantController.clearHistory);

export default router;
