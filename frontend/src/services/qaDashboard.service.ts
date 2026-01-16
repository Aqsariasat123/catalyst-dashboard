import api from './api';
import { ApiResponse } from '@/types';
import { QADashboardData, ProjectQAStats } from '@/types/qa.types';

export const qaDashboardService = {
  async getDashboard(projectId?: string): Promise<QADashboardData> {
    const params = projectId ? `?projectId=${projectId}` : '';
    const response = await api.get<ApiResponse<QADashboardData>>(`/qa/dashboard${params}`);
    return response.data.data!;
  },

  async getProjectStats(): Promise<ProjectQAStats[]> {
    const response = await api.get<ApiResponse<ProjectQAStats[]>>('/qa/dashboard/projects');
    return response.data.data!;
  },
};
