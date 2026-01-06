import api from './api';
import { ApiResponse, PaginatedResponse, Project, ProjectStatus } from '@/types';

export interface CreateProjectData {
  name: string;
  description?: string;
  clientId: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  isActive?: boolean;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  clientId?: string;
  search?: string;
}

export const projectService = {
  async getAll(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(
      `/projects?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data!;
  },

  async getAllSimple(): Promise<Pick<Project, 'id' | 'name' | 'status'>[]> {
    const response = await api.get<ApiResponse<any[]>>('/projects/all');
    return response.data.data!;
  },

  async create(data: CreateProjectData): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data!;
  },

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async addMember(projectId: string, userId: string, role?: string) {
    const response = await api.post<ApiResponse<any>>(`/projects/${projectId}/members`, {
      userId,
      role,
    });
    return response.data.data!;
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },
};
