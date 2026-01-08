import { MilestoneStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export interface CreateMilestoneDTO {
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: MilestoneStatus;
  dueDate?: Date;
}

export interface UpdateMilestoneDTO extends Partial<CreateMilestoneDTO> {
  paymentStatus?: PaymentStatus | null;
}

export class MilestoneService {
  async findByProject(projectId: string, userId?: string, userRole?: string) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Build task filter for developers/designers
    const taskWhere: Prisma.TaskWhereInput = {};
    if ((userRole === 'DEVELOPER' || userRole === 'DESIGNER') && userId) {
      taskWhere.assigneeId = userId;
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      include: {
        tasks: {
          where: taskWhere,
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            _count: {
              select: { timeEntries: true },
            },
          },
          orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });

    // Calculate progress and time for each milestone
    const milestonesWithProgress = await Promise.all(
      milestones.map(async (milestone) => {
        const totalTasks = milestone.tasks.length;
        const completedTasks = milestone.tasks.filter(
          (t) => t.status === 'COMPLETED'
        ).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Calculate total time for all tasks in milestone
        const tasksWithTime = await Promise.all(
          milestone.tasks.map(async (task) => {
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

        const totalTimeSeconds = tasksWithTime.reduce(
          (sum, task) => sum + task.totalTimeSeconds,
          0
        );

        return {
          ...milestone,
          tasks: tasksWithTime,
          progress,
          completedTasks,
          totalTasks,
          totalTimeSeconds,
        };
      })
    );

    return milestonesWithProgress;
  }

  async findById(id: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
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
              select: { timeEntries: true, comments: true },
            },
          },
          orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    // Calculate progress
    const totalTasks = milestone.tasks.length;
    const completedTasks = milestone.tasks.filter(
      (t) => t.status === 'COMPLETED'
    ).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate total time for all tasks
    const tasksWithTime = await Promise.all(
      milestone.tasks.map(async (task) => {
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

    const totalTimeSeconds = tasksWithTime.reduce(
      (sum, task) => sum + task.totalTimeSeconds,
      0
    );

    return {
      ...milestone,
      tasks: tasksWithTime,
      progress,
      completedTasks,
      totalTasks,
      totalTimeSeconds,
    };
  }

  async create(projectId: string, data: CreateMilestoneDTO) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        status: data.status || 'NOT_STARTED',
        dueDate: data.dueDate,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return {
      ...milestone,
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      totalTimeSeconds: 0,
    };
  }

  async update(id: string, data: UpdateMilestoneDTO) {
    const milestone = await this.findById(id);

    const updatedMilestone = await prisma.milestone.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        dueDate: data.dueDate,
        paymentStatus: data.paymentStatus,
        releasedAt: data.paymentStatus === 'RELEASED' ? new Date() : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    // Calculate progress
    const totalTasks = updatedMilestone.tasks.length;
    const completedTasks = updatedMilestone.tasks.filter(
      (t) => t.status === 'COMPLETED'
    ).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...updatedMilestone,
      progress,
      completedTasks,
      totalTasks,
    };
  }

  async delete(id: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    // Check if milestone has tasks
    if (milestone._count.tasks > 0) {
      throw new AppError(
        'Cannot delete milestone with assigned tasks. Please remove or reassign tasks first.',
        400
      );
    }

    await prisma.milestone.delete({
      where: { id },
    });

    return { message: 'Milestone deleted successfully' };
  }

  async updateProgress(id: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        tasks: {
          select: { status: true },
        },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found', 404);
    }

    const totalTasks = milestone.tasks.length;
    const completedTasks = milestone.tasks.filter(
      (t) => t.status === 'COMPLETED'
    ).length;

    // Auto-update milestone status based on task progress
    let newStatus = milestone.status;
    if (totalTasks > 0) {
      if (completedTasks === totalTasks) {
        newStatus = 'COMPLETED';
      } else if (completedTasks > 0 || milestone.tasks.some((t) => t.status === 'IN_PROGRESS')) {
        newStatus = 'IN_PROGRESS';
      }
    }

    if (newStatus !== milestone.status) {
      await prisma.milestone.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return {
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      status: newStatus,
    };
  }
}

export const milestoneService = new MilestoneService();
