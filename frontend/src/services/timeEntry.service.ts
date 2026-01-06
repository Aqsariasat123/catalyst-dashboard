import api from './api';
import { ApiResponse, PaginatedResponse, TimeEntry, ActiveTimer } from '@/types';

export interface TimeEntryFilters {
  page?: number;
  limit?: number;
  userId?: string;
  taskId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  isBillable?: boolean;
}

export interface CreateManualEntryData {
  taskId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  isBillable?: boolean;
}

export const timeEntryService = {
  async getAll(filters: TimeEntryFilters = {}): Promise<PaginatedResponse<TimeEntry>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<PaginatedResponse<TimeEntry>>>(
      `/time-entries?${params}`
    );
    return response.data.data!;
  },

  async getActiveTimer(): Promise<ActiveTimer | null> {
    const response = await api.get<ApiResponse<ActiveTimer | null>>('/time-entries/active');
    return response.data.data ?? null;
  },

  async startTimer(taskId: string, notes?: string): Promise<TimeEntry> {
    const response = await api.post<ApiResponse<TimeEntry>>('/time-entries/start', {
      taskId,
      notes,
    });
    return response.data.data!;
  },

  async stopTimer(timeEntryId?: string, notes?: string): Promise<TimeEntry> {
    const response = await api.post<ApiResponse<TimeEntry>>('/time-entries/stop', {
      timeEntryId,
      notes,
    });
    return response.data.data!;
  },

  async createManualEntry(data: CreateManualEntryData): Promise<TimeEntry> {
    const response = await api.post<ApiResponse<TimeEntry>>('/time-entries/manual', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<CreateManualEntryData>): Promise<TimeEntry> {
    const response = await api.patch<ApiResponse<TimeEntry>>(`/time-entries/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/time-entries/${id}`);
  },

  async getUserStats(userId?: string) {
    const url = userId ? `/time-entries/stats/${userId}` : '/time-entries/stats';
    const response = await api.get<ApiResponse<any>>(url);
    return response.data.data!;
  },

  async getProjectReport(projectId: string) {
    const response = await api.get<ApiResponse<any>>(`/time-entries/project/${projectId}/report`);
    return response.data.data!;
  },
};
