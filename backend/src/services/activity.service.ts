import { prisma } from '../config/database.js';

export interface CreateActivityDTO {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityService {
  async log(data: CreateActivityDTO) {
    return prisma.activityLog.create({
      data: {
        ...data,
        details: data.details as any,
      },
    });
  }

  async getRecentActivities(limit = 20) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
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

  async getUserActivities(userId: string, limit = 20) {
    return prisma.activityLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const activityService = new ActivityService();
