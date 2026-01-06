import api from './api';
import { ApiResponse, Milestone, MilestoneStatus } from '@/types';

export interface CreateMilestoneData {
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: MilestoneStatus;
  dueDate?: string;
}

export interface UpdateMilestoneData extends Partial<CreateMilestoneData> {}

export const milestoneService = {
  async getByProject(projectId: string): Promise<Milestone[]> {
    const response = await api.get<ApiResponse<Milestone[]>>(
      `/projects/${projectId}/milestones`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<Milestone> {
    const response = await api.get<ApiResponse<Milestone>>(`/milestones/${id}`);
    return response.data.data!;
  },

  async create(projectId: string, data: CreateMilestoneData): Promise<Milestone> {
    const response = await api.post<ApiResponse<Milestone>>(
      `/projects/${projectId}/milestones`,
      data
    );
    return response.data.data!;
  },

  async update(id: string, data: UpdateMilestoneData): Promise<Milestone> {
    const response = await api.patch<ApiResponse<Milestone>>(
      `/milestones/${id}`,
      data
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/milestones/${id}`);
  },
};
