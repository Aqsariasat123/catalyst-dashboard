import api from './api';
import { ApiResponse, DashboardStats, DeveloperStats, Notification } from '@/types';

export const dashboardService = {
  async getAdminDashboard(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/admin');
    return response.data.data!;
  },

  async getDeveloperDashboard(): Promise<DeveloperStats> {
    const response = await api.get<ApiResponse<DeveloperStats>>('/dashboard/developer');
    return response.data.data!;
  },

  async getMyDashboard(): Promise<DashboardStats | DeveloperStats> {
    const response = await api.get<ApiResponse<DashboardStats | DeveloperStats>>('/dashboard');
    return response.data.data!;
  },

  async getTeamOverview() {
    const response = await api.get<ApiResponse<any[]>>('/dashboard/team');
    return response.data.data!;
  },

  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(
      `/dashboard/notifications${unreadOnly ? '?unreadOnly=true' : ''}`
    );
    return response.data.data!;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>('/dashboard/notifications/unread-count');
    return response.data.data!.count;
  },

  async markNotificationRead(id: string) {
    await api.post(`/dashboard/notifications/${id}/read`);
  },

  async markAllNotificationsRead() {
    await api.post('/dashboard/notifications/read-all');
  },

  async getTimeReport(userId?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = userId
      ? `/dashboard/time-report/${userId}?${params}`
      : `/dashboard/time-report?${params}`;

    const response = await api.get<ApiResponse<any>>(url);
    return response.data.data!;
  },
};
