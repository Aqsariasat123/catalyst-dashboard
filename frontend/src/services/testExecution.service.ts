import api from './api';
import { ApiResponse, PaginatedResponse } from '@/types';
import {
  TestExecution,
  ExecutionFilters,
  ExecuteTestData,
} from '@/types/qa.types';

export const testExecutionService = {
  async getAll(filters: ExecutionFilters = {}): Promise<PaginatedResponse<TestExecution>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<TestExecution>>>(
      `/qa/executions?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<TestExecution> {
    const response = await api.get<ApiResponse<TestExecution>>(`/qa/executions/${id}`);
    return response.data.data!;
  },

  async getHistory(testCaseId: string): Promise<TestExecution[]> {
    const response = await api.get<ApiResponse<TestExecution[]>>(
      `/qa/executions/history/${testCaseId}`
    );
    return response.data.data!;
  },

  async execute(testCaseId: string, data: ExecuteTestData): Promise<TestExecution> {
    const response = await api.post<ApiResponse<TestExecution>>(
      `/qa/executions`,
      { testCaseId, ...data }
    );
    return response.data.data!;
  },

  async bulkExecute(
    testCaseIds: string[],
    status: ExecuteTestData['status'],
    notes?: string
  ): Promise<TestExecution[]> {
    const response = await api.post<ApiResponse<TestExecution[]>>('/qa/executions/bulk', {
      testCaseIds,
      status,
      notes,
    });
    return response.data.data!;
  },

  async update(id: string, data: Partial<ExecuteTestData>): Promise<TestExecution> {
    const response = await api.patch<ApiResponse<TestExecution>>(`/qa/executions/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/qa/executions/${id}`);
  },
};
