import api from './api';
import { ApiResponse, PaginatedResponse } from '@/types';
import {
  TestCase,
  TestCaseFilters,
  CreateTestCaseData,
  UpdateTestCaseData,
} from '@/types/qa.types';

export const testCaseService = {
  async getAll(filters: TestCaseFilters = {}): Promise<PaginatedResponse<TestCase>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<TestCase>>>(
      `/qa/test-cases?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<TestCase> {
    const response = await api.get<ApiResponse<TestCase>>(`/qa/test-cases/${id}`);
    return response.data.data!;
  },

  async getByTask(taskId: string): Promise<TestCase[]> {
    const response = await api.get<ApiResponse<TestCase[]>>(`/qa/test-cases/task/${taskId}`);
    return response.data.data!;
  },

  async getByProject(projectId: string): Promise<TestCase[]> {
    const response = await api.get<ApiResponse<TestCase[]>>(`/qa/test-cases/project/${projectId}`);
    return response.data.data!;
  },

  async create(data: CreateTestCaseData): Promise<TestCase> {
    const response = await api.post<ApiResponse<TestCase>>('/qa/test-cases', data);
    return response.data.data!;
  },

  async update(id: string, data: UpdateTestCaseData): Promise<TestCase> {
    const response = await api.patch<ApiResponse<TestCase>>(`/qa/test-cases/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/qa/test-cases/${id}`);
  },

  async getStats(projectId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const params = projectId ? `?projectId=${projectId}` : '';
    const response = await api.get<ApiResponse<any>>(`/qa/test-cases/stats${params}`);
    return response.data.data!;
  },
};
