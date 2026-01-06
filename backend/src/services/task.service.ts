import { TaskStatus, TaskPriority, ReviewStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination } from '../utils/helpers.js';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimatedHours?: number;
  dueDate?: Date;
}

export interface UpdateTaskDTO extends Partial<Omit<CreateTaskDTO, 'projectId'>> {
  completedAt?: Date | null;
}

export interface ReviewTaskDTO {
  reviewStatus: ReviewStatus;
  reviewComment?: string;
  hasBugs?: boolean;
}

export class TaskService {
  async findAll(
    pagination: PaginationParams,
    filters?: {
      projectId?: string;
      assigneeId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
    },
    userId?: string,
    userRole?: string
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.TaskWhereInput = {};

    // If developer or designer, only show their assigned tasks
    if ((userRole === 'DEVELOPER' || userRole === 'DESIGNER') && userId) {
      where.assigneeId = userId;
    }

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.task.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const tasks = await prisma.task.findMany({
      where,
      skip,
      take,
      include: {
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
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            timeEntries: true,
            comments: true,
          },
        },
      },
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder }
        : [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Calculate total time for each task
    const tasksWithTime = await Promise.all(
      tasks.map(async (task) => {
        const timeEntries = await prisma.timeEntry.aggregate({
          where: { taskId: task.id },
          _sum: { duration: true },
        });

        return {
          ...task,
          totalTimeSeconds: timeEntries._sum.duration || 0,
        };
      })
    );

    return {
      data: tasksWithTime,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    };
  }

  async findById(id: string, userId?: string, userRole?: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
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
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        timeEntries: {
          orderBy: { startTime: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check access for developers and designers
    if ((userRole === 'DEVELOPER' || userRole === 'DESIGNER') && userId) {
      const isMember = task.project.members.some((m) => m.userId === userId);
      const isAssignee = task.assigneeId === userId;
      if (!isMember && !isAssignee) {
        throw new AppError('Access denied', 403);
      }
    }

    // Calculate total time
    const totalTime = await prisma.timeEntry.aggregate({
      where: { taskId: id },
      _sum: { duration: true },
    });

    return {
      ...task,
      totalTimeSeconds: totalTime._sum.duration || 0,
    };
  }

  async create(data: CreateTaskDTO, createdById: string) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Verify assignee if provided
    if (data.assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assigneeId },
      });

      if (!user) {
        throw new AppError('Assignee not found', 404);
      }
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        createdById,
        estimatedHours: data.estimatedHours,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for assignee
    if (data.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: data.assigneeId,
          title: 'New Task Assigned',
          message: `You have been assigned to task: ${task.title}`,
          type: 'TASK_ASSIGNED',
          data: { taskId: task.id, projectId: task.projectId },
        },
      });
    }

    return task;
  }

  async update(id: string, data: UpdateTaskDTO, userId: string, userRole: string) {
    const task = await this.findById(id, userId, userRole);

    // If status is being changed to COMPLETED, set completedAt
    if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      data.completedAt = new Date();
    } else if (data.status && data.status !== 'COMPLETED' && task.completedAt) {
      data.completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        estimatedHours: data.estimatedHours,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify new assignee
    if (data.assigneeId && data.assigneeId !== task.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: data.assigneeId,
          title: 'Task Assigned',
          message: `You have been assigned to task: ${updatedTask.title}`,
          type: 'TASK_ASSIGNED',
          data: { taskId: id, projectId: updatedTask.projectId },
        },
      });
    }

    return updatedTask;
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }

  async addComment(taskId: string, userId: string, content: string) {
    await this.findById(taskId);

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
    });

    return comment;
  }

  async getTasksByProject(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { timeEntries: true },
        },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getMyTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: {
          notIn: ['COMPLETED'],
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { timeEntries: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async reviewTask(taskId: string, reviewerId: string, data: ReviewTaskDTO) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Task should be in IN_REVIEW or COMPLETED status to be reviewed
    if (task.status !== 'IN_REVIEW' && task.status !== 'COMPLETED') {
      throw new AppError('Task must be in review or completed status to be reviewed', 400);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        reviewStatus: data.reviewStatus,
        reviewComment: data.reviewComment,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        hasBugs: data.hasBugs ?? false,
        // If rejected or needs changes, set status back to IN_PROGRESS
        status: data.reviewStatus === 'REJECTED' || data.reviewStatus === 'NEEDS_CHANGES'
          ? 'IN_PROGRESS'
          : task.status,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify the assignee about the review
    if (task.assigneeId) {
      const reviewStatusMessages: Record<ReviewStatus, string> = {
        PENDING: 'is pending review',
        APPROVED: 'has been approved',
        REJECTED: 'has been rejected',
        NEEDS_CHANGES: 'needs changes',
      };

      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: 'Task Review Update',
          message: `Your task "${task.title}" ${reviewStatusMessages[data.reviewStatus]}${data.hasBugs ? ' (bugs found)' : ''}`,
          type: 'TASK_REVIEWED',
          data: {
            taskId: task.id,
            projectId: task.projectId,
            reviewStatus: data.reviewStatus,
            hasBugs: data.hasBugs,
          },
        },
      });
    }

    return updatedTask;
  }

  async getTasksForReview(projectId?: string) {
    const where: Prisma.TaskWhereInput = {
      OR: [
        { status: 'IN_REVIEW' },
        { status: 'COMPLETED', reviewStatus: null },
      ],
    };

    if (projectId) {
      where.projectId = projectId;
    }

    return prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }
}

export const taskService = new TaskService();
