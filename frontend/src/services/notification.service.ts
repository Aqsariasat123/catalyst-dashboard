import api from './api';
import { ApiResponse } from '@/types';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(
      `/notifications${unreadOnly ? '?unreadOnly=true' : ''}`
    );
    return response.data.data || [];
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data?.count || 0;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data.data!;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  },
};
