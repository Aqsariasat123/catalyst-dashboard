import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse, ActiveTimer } from '../types/index.js';
import { calculatePagination, getStartOfWeek, getStartOfMonth } from '../utils/helpers.js';

export interface CreateTimeEntryDTO {
  taskId: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  isBillable?: boolean;
}

export interface UpdateTimeEntryDTO {
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  isBillable?: boolean;
}

export class TimeEntryService {
  async findAll(
    pagination: PaginationParams,
    filters?: {
      userId?: string;
      taskId?: string;
      projectId?: string;
      startDate?: Date;
      endDate?: Date;
      isBillable?: boolean;
    }
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.TimeEntryWhereInput = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters?.projectId) {
      where.task = {
        projectId: filters.projectId,
      };
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startTime.lte = filters.endDate;
      }
    }

    if (filters?.isBillable !== undefined) {
      where.isBillable = filters.isBillable;
    }

    const total = await prisma.timeEntry.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const entries = await prisma.timeEntry.findMany({
      where,
      skip,
      take,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return {
      data: entries,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    };
  }

  async startTimer(userId: string, taskId: string, notes?: string, userRole?: string) {
    // Check for existing active timer
    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
    });

    if (activeTimer) {
      throw new AppError('You already have an active timer. Stop it first.', 400);
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Admin and Project Managers can start timer on any task
    const isAdminOrPM = userRole === 'ADMIN' || userRole === 'PROJECT_MANAGER';

    // Check if user is assigned to task or is a project member
    const isAssignee = task.assigneeId === userId;
    const isMember = task.project.members.length > 0;

    if (!isAdminOrPM && !isAssignee && !isMember) {
      throw new AppError('You do not have access to this task', 403);
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        startTime: new Date(),
        notes,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update task status to IN_PROGRESS if it's in TODO
    if (task.status === 'TODO') {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return timeEntry;
  }

  async stopTimer(userId: string, timeEntryId?: string, notes?: string) {
    const where: Prisma.TimeEntryWhereInput = {
      userId,
      endTime: null,
    };

    if (timeEntryId) {
      where.id = timeEntryId;
    }

    const activeEntry = await prisma.timeEntry.findFirst({
      where,
    });

    if (!activeEntry) {
      throw new AppError('No active timer found', 404);
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / 1000);

    const timeEntry = await prisma.timeEntry.update({
      where: { id: activeEntry.id },
      data: {
        endTime,
        duration,
        notes: notes || activeEntry.notes,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return timeEntry;
  }

  async getActiveTimer(userId: string): Promise<ActiveTimer | null> {
    const activeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!activeEntry) {
      return null;
    }

    const elapsedSeconds = Math.floor((new Date().getTime() - activeEntry.startTime.getTime()) / 1000);

    return {
      timeEntryId: activeEntry.id,
      taskId: activeEntry.task.id,
      taskTitle: activeEntry.task.title,
      projectName: activeEntry.task.project.name,
      startTime: activeEntry.startTime,
      elapsedSeconds,
    };
  }

  async createManualEntry(userId: string, data: CreateTimeEntryDTO) {
    if (!data.startTime || !data.endTime) {
      throw new AppError('Start time and end time are required for manual entries', 400);
    }

    if (data.endTime <= data.startTime) {
      throw new AppError('End time must be after start time', 400);
    }

    // Verify task access
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const duration = Math.floor((data.endTime.getTime() - data.startTime.getTime()) / 1000);

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId: data.taskId,
        userId,
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        notes: data.notes,
        isBillable: data.isBillable ?? true,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return timeEntry;
  }

  async update(id: string, userId: string, data: UpdateTimeEntryDTO) {
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new AppError('Time entry not found', 404);
    }

    if (entry.userId !== userId) {
      throw new AppError('You can only update your own time entries', 403);
    }

    let duration = entry.duration;
    if (data.startTime && data.endTime) {
      duration = Math.floor((data.endTime.getTime() - data.startTime.getTime()) / 1000);
    } else if (data.startTime && entry.endTime) {
      duration = Math.floor((entry.endTime.getTime() - data.startTime.getTime()) / 1000);
    } else if (data.endTime && entry.startTime) {
      duration = Math.floor((data.endTime.getTime() - entry.startTime.getTime()) / 1000);
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...data,
        duration,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return timeEntry;
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const entry = await prisma.timeEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new AppError('Time entry not found', 404);
    }

    if (entry.userId !== userId && !isAdmin) {
      throw new AppError('You can only delete your own time entries', 403);
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    return { message: 'Time entry deleted successfully' };
  }

  async getUserTimeStats(userId: string) {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = getStartOfMonth(now);

    const [totalTime, weeklyTime, monthlyTime] = await Promise.all([
      prisma.timeEntry.aggregate({
        where: { userId },
        _sum: { duration: true },
      }),
      prisma.timeEntry.aggregate({
        where: {
          userId,
          startTime: { gte: startOfWeek },
        },
        _sum: { duration: true },
      }),
      prisma.timeEntry.aggregate({
        where: {
          userId,
          startTime: { gte: startOfMonth },
        },
        _sum: { duration: true },
      }),
    ]);

    return {
      totalSeconds: totalTime._sum.duration || 0,
      weeklySeconds: weeklyTime._sum.duration || 0,
      monthlySeconds: monthlyTime._sum.duration || 0,
      totalHours: Math.round(((totalTime._sum.duration || 0) / 3600) * 100) / 100,
      weeklyHours: Math.round(((weeklyTime._sum.duration || 0) / 3600) * 100) / 100,
      monthlyHours: Math.round(((monthlyTime._sum.duration || 0) / 3600) * 100) / 100,
    };
  }

  async getProjectTimeReport(projectId: string) {
    const entries = await prisma.timeEntry.findMany({
      where: {
        task: {
          projectId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const totalDuration = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

    // Group by user
    const byUser: Record<string, { user: any; totalSeconds: number; entries: number }> = {};
    entries.forEach((entry) => {
      if (!byUser[entry.userId]) {
        byUser[entry.userId] = {
          user: entry.user,
          totalSeconds: 0,
          entries: 0,
        };
      }
      byUser[entry.userId].totalSeconds += entry.duration || 0;
      byUser[entry.userId].entries += 1;
    });

    // Group by task
    const byTask: Record<string, { task: any; totalSeconds: number; entries: number }> = {};
    entries.forEach((entry) => {
      if (!byTask[entry.taskId]) {
        byTask[entry.taskId] = {
          task: entry.task,
          totalSeconds: 0,
          entries: 0,
        };
      }
      byTask[entry.taskId].totalSeconds += entry.duration || 0;
      byTask[entry.taskId].entries += 1;
    });

    return {
      totalSeconds: totalDuration,
      totalHours: Math.round((totalDuration / 3600) * 100) / 100,
      byUser: Object.values(byUser),
      byTask: Object.values(byTask),
    };
  }
}

export const timeEntryService = new TimeEntryService();
