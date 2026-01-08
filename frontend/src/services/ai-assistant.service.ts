import { api } from './api';

interface ChatContext {
  page?: string;
  projectId?: string;
  clientId?: string;
}

interface ChatResponse {
  success: boolean;
  data: {
    response: string;
  };
}

export const aiAssistantService = {
  async chat(message: string, context?: ChatContext): Promise<string> {
    const response = await api.post<ChatResponse>('/ai-assistant/chat', { message, context });
    return response.data.data.response;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/ai-assistant/history');
  },
};
