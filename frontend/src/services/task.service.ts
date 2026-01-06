import api from './api';
import { ApiResponse, PaginatedResponse, Task, TaskPriority, TaskStatus, ReviewStatus } from '@/types';

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  milestoneId?: string | null;
  assigneeId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateTaskData extends Partial<Omit<CreateTaskData, 'projectId'>> {}

export interface TaskFilters {
  page?: number;
  limit?: number;
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface ReviewTaskData {
  reviewStatus: ReviewStatus;
  reviewComment?: string;
  hasBugs?: boolean;
}

export const taskService = {
  async getAll(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<Task>>>(
      `/tasks?${params}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>('/tasks/my');
    return response.data.data!;
  },

  async getByProject(projectId: string): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`);
    return response.data.data!;
  },

  async create(data: CreateTaskData): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data!;
  },

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async addComment(id: string, content: string) {
    const response = await api.post<ApiResponse<any>>(`/tasks/${id}/comments`, { content });
    return response.data.data!;
  },

  async getTasksForReview(projectId?: string): Promise<Task[]> {
    const params = projectId ? `?projectId=${projectId}` : '';
    const response = await api.get<ApiResponse<Task[]>>(`/tasks/review/pending${params}`);
    return response.data.data!;
  },

  async reviewTask(id: string, data: ReviewTaskData): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/review`, data);
    return response.data.data!;
  },
};
