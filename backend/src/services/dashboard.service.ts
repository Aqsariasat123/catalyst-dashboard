import { prisma } from '../config/database.js';
import { DashboardStats, DeveloperStats } from '../types/index.js';
import { getStartOfWeek, getStartOfMonth } from '../utils/helpers.js';

export class DashboardService {
  async getAdminDashboard(): Promise<DashboardStats> {
    const [
      totalProjects,
      totalTasks,
      totalClients,
      totalDevelopers,
      timeEntries,
      projectsByStatus,
      tasksByStatus,
      recentActivities,
    ] = await Promise.all([
      prisma.project.count({ where: { isActive: true } }),
      prisma.task.count(),
      prisma.client.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'DEVELOPER', isActive: true } }),
      prisma.timeEntry.aggregate({
        _sum: { duration: true },
      }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { isActive: true },
      }),
      prisma.task.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const projectsStatusMap: Record<string, number> = {};
    projectsByStatus.forEach((p) => {
      projectsStatusMap[p.status] = p._count.status;
    });

    const tasksStatusMap: Record<string, number> = {};
    tasksByStatus.forEach((t) => {
      tasksStatusMap[t.status] = t._count.status;
    });

    return {
      totalProjects,
      totalTasks,
      totalClients,
      totalDevelopers,
      totalTrackedHours: Math.round(((timeEntries._sum.duration || 0) / 3600) * 100) / 100,
      projectsByStatus: projectsStatusMap,
      tasksByStatus: tasksStatusMap,
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        userName: `${a.user.firstName} ${a.user.lastName}`,
        createdAt: a.createdAt,
      })),
    };
  }

  async getDeveloperDashboard(userId: string): Promise<DeveloperStats> {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = getStartOfMonth(now);

    const [
      assignedTasks,
      completedTasks,
      inProgressTasks,
      totalTime,
      weeklyTime,
      monthlyTime,
      activeTimer,
    ] = await Promise.all([
      prisma.task.count({
        where: { assigneeId: userId },
      }),
      prisma.task.count({
        where: { assigneeId: userId, status: 'COMPLETED' },
      }),
      prisma.task.count({
        where: { assigneeId: userId, status: 'IN_PROGRESS' },
      }),
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
      prisma.timeEntry.findFirst({
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
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let activeTimerData = null;
    if (activeTimer) {
      const elapsedSeconds = Math.floor(
        (new Date().getTime() - activeTimer.startTime.getTime()) / 1000
      );
      activeTimerData = {
        timeEntryId: activeTimer.id,
        taskId: activeTimer.task.id,
        taskTitle: activeTimer.task.title,
        projectName: activeTimer.task.project.name,
        startTime: activeTimer.startTime,
        elapsedSeconds,
      };
    }

    return {
      assignedTasks,
      completedTasks,
      inProgressTasks,
      totalTrackedHours: Math.round(((totalTime._sum.duration || 0) / 3600) * 100) / 100,
      weeklyHours: Math.round(((weeklyTime._sum.duration || 0) / 3600) * 100) / 100,
      monthlyHours: Math.round(((monthlyTime._sum.duration || 0) / 3600) * 100) / 100,
      activeTimer: activeTimerData,
    };
  }

  async getDeveloperTimeReport(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = startDate;
      if (endDate) where.startTime.lte = endDate;
    }

    const entries = await prisma.timeEntry.findMany({
      where,
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
      },
      orderBy: { startTime: 'desc' },
    });

    // Group by project
    const byProject: Record<string, { project: any; totalSeconds: number; entries: any[] }> = {};
    entries.forEach((entry) => {
      const projectId = entry.task.project.id;
      if (!byProject[projectId]) {
        byProject[projectId] = {
          project: entry.task.project,
          totalSeconds: 0,
          entries: [],
        };
      }
      byProject[projectId].totalSeconds += entry.duration || 0;
      byProject[projectId].entries.push(entry);
    });

    // Group by day
    const byDay: Record<string, { date: string; totalSeconds: number; entries: number }> = {};
    entries.forEach((entry) => {
      const date = entry.startTime.toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = {
          date,
          totalSeconds: 0,
          entries: 0,
        };
      }
      byDay[date].totalSeconds += entry.duration || 0;
      byDay[date].entries += 1;
    });

    const totalDuration = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

    return {
      totalSeconds: totalDuration,
      totalHours: Math.round((totalDuration / 3600) * 100) / 100,
      byProject: Object.values(byProject),
      byDay: Object.values(byDay).sort((a, b) => b.date.localeCompare(a.date)),
      entries,
    };
  }

  async getTeamOverview() {
    const developers = await prisma.user.findMany({
      where: {
        role: 'DEVELOPER',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        userType: true,
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
    });

    // Get time stats for each developer
    const developersWithStats = await Promise.all(
      developers.map(async (dev) => {
        const now = new Date();
        const startOfWeek = getStartOfWeek(now);

        const [totalTime, weeklyTime, activeTimer] = await Promise.all([
          prisma.timeEntry.aggregate({
            where: { userId: dev.id },
            _sum: { duration: true },
          }),
          prisma.timeEntry.aggregate({
            where: {
              userId: dev.id,
              startTime: { gte: startOfWeek },
            },
            _sum: { duration: true },
          }),
          prisma.timeEntry.findFirst({
            where: {
              userId: dev.id,
              endTime: null,
            },
          }),
        ]);

        return {
          ...dev,
          totalHours: Math.round(((totalTime._sum.duration || 0) / 3600) * 100) / 100,
          weeklyHours: Math.round(((weeklyTime._sum.duration || 0) / 3600) * 100) / 100,
          hasActiveTimer: !!activeTimer,
        };
      })
    );

    return developersWithStats;
  }
}

export const dashboardService = new DashboardService();
