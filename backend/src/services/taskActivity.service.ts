import { prisma } from '../config/database.js';

export type ActivityAction =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'TIMER_STARTED'
  | 'TIMER_STOPPED'
  | 'DUE_DATE_CHANGED'
  | 'DESCRIPTION_CHANGED'
  | 'TITLE_CHANGED'
  | 'MILESTONE_CHANGED'
  | 'REVIEW_STATUS_CHANGED'
  | 'COMPLETED'
  | 'UPDATED';

export interface CreateActivityDTO {
  taskId: string;
  userId: string;
  action: ActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}

export class TaskActivityService {
  async create(data: CreateActivityDTO) {
    return prisma.taskActivity.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        action: data.action,
        field: data.field,
        oldValue: data.oldValue,
        newValue: data.newValue,
        metadata: data.metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByTask(taskId: string, limit = 20) {
    return prisma.taskActivity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  // Helper to record task field changes
  async recordChange(
    taskId: string,
    userId: string,
    field: string,
    oldValue: string | null | undefined,
    newValue: string | null | undefined
  ) {
    if (oldValue === newValue) return null;

    const actionMap: Record<string, ActivityAction> = {
      status: 'STATUS_CHANGED',
      assigneeId: 'ASSIGNEE_CHANGED',
      priority: 'PRIORITY_CHANGED',
      dueDate: 'DUE_DATE_CHANGED',
      description: 'DESCRIPTION_CHANGED',
      title: 'TITLE_CHANGED',
      milestoneId: 'MILESTONE_CHANGED',
      reviewStatus: 'REVIEW_STATUS_CHANGED',
    };

    const action = actionMap[field] || 'UPDATED';

    return this.create({
      taskId,
      userId,
      action,
      field,
      oldValue: oldValue?.toString(),
      newValue: newValue?.toString(),
    });
  }

  // Record timer events
  async recordTimerStart(taskId: string, userId: string) {
    return this.create({
      taskId,
      userId,
      action: 'TIMER_STARTED',
    });
  }

  async recordTimerStop(taskId: string, userId: string, duration: number) {
    return this.create({
      taskId,
      userId,
      action: 'TIMER_STOPPED',
      metadata: { duration },
    });
  }

  // Record task creation
  async recordCreation(taskId: string, userId: string) {
    return this.create({
      taskId,
      userId,
      action: 'CREATED',
    });
  }
}

export const taskActivityService = new TaskActivityService();
