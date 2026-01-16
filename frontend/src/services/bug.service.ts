import api from './api';
import { ApiResponse, PaginatedResponse } from '@/types';
import {
  Bug,
  BugFilters,
  BugActivity,
  CreateBugData,
  UpdateBugData,
  BugStatus,
} from '@/types/qa.types';

export const bugService = {
  async getAll(filters: BugFilters = {}): Promise<PaginatedResponse<Bug>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<Bug>>>(
      `/qa/bugs?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<Bug> {
    const response = await api.get<ApiResponse<Bug>>(`/qa/bugs/${id}`);
    return response.data.data!;
  },

  async getByProject(projectId: string): Promise<Bug[]> {
    const response = await api.get<ApiResponse<Bug[]>>(`/qa/bugs/project/${projectId}`);
    return response.data.data!;
  },

  async getByTestCase(testCaseId: string): Promise<Bug[]> {
    const response = await api.get<ApiResponse<Bug[]>>(`/qa/bugs/test-case/${testCaseId}`);
    return response.data.data!;
  },

  async create(data: CreateBugData): Promise<Bug> {
    const response = await api.post<ApiResponse<Bug>>('/qa/bugs', data);
    return response.data.data!;
  },

  async update(id: string, data: UpdateBugData): Promise<Bug> {
    const response = await api.patch<ApiResponse<Bug>>(`/qa/bugs/${id}`, data);
    return response.data.data!;
  },

  async updateStatus(id: string, status: BugStatus, comment?: string): Promise<Bug> {
    const response = await api.patch<ApiResponse<Bug>>(`/qa/bugs/${id}/status`, {
      status,
      comment,
    });
    return response.data.data!;
  },

  async assign(id: string, assignedToId: string): Promise<Bug> {
    const response = await api.patch<ApiResponse<Bug>>(`/qa/bugs/${id}/assign`, {
      assignedToId,
    });
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/qa/bugs/${id}`);
  },

  async addComment(id: string, comment: string): Promise<BugActivity> {
    const response = await api.post<ApiResponse<BugActivity>>(`/qa/bugs/${id}/comments`, {
      comment,
    });
    return response.data.data!;
  },

  async getActivities(id: string): Promise<BugActivity[]> {
    const response = await api.get<ApiResponse<BugActivity[]>>(`/qa/bugs/${id}/activities`);
    return response.data.data!;
  },
};
