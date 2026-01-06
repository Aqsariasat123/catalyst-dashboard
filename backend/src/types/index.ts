import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface TimeStats {
  totalSeconds: number;
  totalHours: number;
  formattedTime: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  totalClients: number;
  totalDevelopers: number;
  totalTrackedHours: number;
  projectsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
  recentActivities: ActivitySummary[];
}

export interface ActivitySummary {
  id: string;
  action: string;
  entityType: string;
  userName: string;
  createdAt: Date;
}

export interface DeveloperStats {
  assignedTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalTrackedHours: number;
  weeklyHours: number;
  monthlyHours: number;
  activeTimer: ActiveTimer | null;
}

export interface ActiveTimer {
  timeEntryId: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  startTime: Date;
  elapsedSeconds: number;
}
