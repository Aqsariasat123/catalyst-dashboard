import { Response } from 'express';
import { ApiResponse, PaginationParams, TimeStats } from '../types/index.js';

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data: ApiResponse<T>
): Response {
  return res.status(statusCode).json(data);
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: Record<string, string[]>
): Response {
  return sendResponse(res, statusCode, {
    success: false,
    message,
    errors,
  });
}

export function getPaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '10'), 10)));
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : undefined;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, limit, sortBy, sortOrder };
}

export function calculatePagination(
  total: number,
  page: number,
  limit: number
): { skip: number; take: number; totalPages: number } {
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  return { skip, take: limit, totalPages };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export function calculateTimeStats(entries: { duration: number | null }[]): TimeStats {
  const totalSeconds = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;

  return {
    totalSeconds,
    totalHours,
    formattedTime: formatDuration(totalSeconds),
  };
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function excludeFields<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
