import { Response } from 'express';
import { aiAssistantService } from '../services/ai-assistant.service.js';
import { AuthRequest } from '../types/index.js';

// Store conversation history per user session
const conversationStore = new Map<string, any[]>();

export const aiAssistantController = {
  async chat(req: AuthRequest, res: Response) {
    try {
      const { message, context } = req.body;
      const userId = req.user!.userId;
      const sessionKey = `${userId}-ai-chat`;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      // Get conversation history (keep minimal)
      const history = conversationStore.get(sessionKey) || [];

      // Call AI service with retry
      const result = await aiAssistantService.chat(message, userId, history, context);

      // Store updated history (keep last 4 messages only)
      const updatedHistory = result.conversationHistory.slice(-4);
      conversationStore.set(sessionKey, updatedHistory);

      res.json({
        success: true,
        data: {
          response: result.response,
        },
      });
    } catch (error: any) {
      console.error('AI Assistant error:', error);

      // Handle rate limit error
      if (error.status === 429 || error.message?.includes('rate_limit')) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit reached. Please wait 30 seconds and try again.',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process AI request',
      });
    }
  },

  async clearHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const sessionKey = `${userId}-ai-chat`;
      conversationStore.delete(sessionKey);

      res.json({
        success: true,
        message: 'Conversation history cleared',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
