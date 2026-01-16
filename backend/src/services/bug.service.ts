import { BugSeverity, BugStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination } from '../utils/helpers.js';

export interface CreateBugDTO {
  title: string;
  description: string;
  severity?: BugSeverity;
  stepsToReproduce?: string;
  environment?: string;
  actualResult?: string;
  expectedResult?: string;
  testCaseId?: string;
  testExecutionId?: string;
  taskId: string;
  projectId: string;
  milestoneId?: string;
  assignedToId?: string;
}

export interface UpdateBugDTO extends Partial<Omit<CreateBugDTO, 'projectId' | 'taskId'>> {
  status?: BugStatus;
  resolution?: string;
}

export interface BugFilters {
  projectId?: string;
  milestoneId?: string;
  taskId?: string;
  testCaseId?: string;
  status?: BugStatus;
  severity?: BugSeverity;
  reportedById?: string;
  assignedToId?: string;
  search?: string;
}

export class BugService {
  async findAll(
    pagination: PaginationParams,
    filters?: BugFilters
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.BugWhereInput = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    if (filters?.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters?.testCaseId) {
      where.testCaseId = filters.testCaseId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.reportedById) {
      where.reportedById = filters.reportedById;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.bug.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const bugs = await prisma.bug.findMany({
      where,
      skip,
      take,
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
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
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            attachments: true,
            activities: true,
          },
        },
      },
      orderBy: [
        { severity: 'asc' }, // CRITICAL first
        { createdAt: 'desc' },
      ],
    });

    return {
      data: bugs,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<any> {
    const bug = await prisma.bug.findUnique({
      where: { id },
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
            steps: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
        milestone: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: true,
        activities: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!bug) {
      throw new AppError('Bug not found', 404);
    }

    return bug;
  }

  async getByProject(projectId: string): Promise<any[]> {
    return prisma.bug.findMany({
      where: { projectId },
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            attachments: true,
          },
        },
      },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getByTestCase(testCaseId: string): Promise<any[]> {
    return prisma.bug.findMany({
      where: { testCaseId },
      include: {
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateBugDTO, userId: string): Promise<any> {
    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      select: { projectId: true, milestoneId: true, assigneeId: true },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // If test case provided, verify it exists
    if (data.testCaseId) {
      const testCase = await prisma.testCase.findUnique({
        where: { id: data.testCaseId },
      });
      if (!testCase) {
        throw new AppError('Test case not found', 404);
      }
    }

    const bug = await prisma.bug.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity || 'MEDIUM',
        stepsToReproduce: data.stepsToReproduce,
        environment: data.environment,
        actualResult: data.actualResult,
        expectedResult: data.expectedResult,
        testCaseId: data.testCaseId,
        testExecutionId: data.testExecutionId,
        taskId: data.taskId,
        projectId: data.projectId,
        milestoneId: data.milestoneId || task.milestoneId,
        reportedById: userId,
        assignedToId: data.assignedToId || task.assigneeId, // Default to task assignee
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log creation activity
    await prisma.bugActivity.create({
      data: {
        bugId: bug.id,
        userId,
        action: 'CREATED',
        newValue: 'Bug created',
      },
    });

    // Update task hasBugs flag
    await prisma.task.update({
      where: { id: data.taskId },
      data: { hasBugs: true },
    });

    return bug;
  }

  async update(id: string, data: UpdateBugDTO, userId: string): Promise<any> {
    const existing = await prisma.bug.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Bug not found', 404);
    }

    // Track changes for activity log
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

    if (data.title && data.title !== existing.title) {
      changes.push({ field: 'title', oldValue: existing.title, newValue: data.title });
    }
    if (data.severity && data.severity !== existing.severity) {
      changes.push({ field: 'severity', oldValue: existing.severity, newValue: data.severity });
    }
    if (data.assignedToId !== undefined && data.assignedToId !== existing.assignedToId) {
      changes.push({
        field: 'assignedTo',
        oldValue: existing.assignedToId || 'Unassigned',
        newValue: data.assignedToId || 'Unassigned',
      });
    }

    const bug = await prisma.bug.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        stepsToReproduce: data.stepsToReproduce,
        environment: data.environment,
        actualResult: data.actualResult,
        expectedResult: data.expectedResult,
        milestoneId: data.milestoneId,
        assignedToId: data.assignedToId,
        resolution: data.resolution,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log changes
    for (const change of changes) {
      await prisma.bugActivity.create({
        data: {
          bugId: id,
          userId,
          action: 'UPDATED',
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
        },
      });
    }

    return bug;
  }

  async updateStatus(id: string, status: BugStatus, userId: string, comment?: string): Promise<any> {
    const existing = await prisma.bug.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Bug not found', 404);
    }

    const updateData: Prisma.BugUpdateInput = {
      status,
    };

    // If closing, set resolved info
    if (status === 'CLOSED') {
      updateData.resolvedBy = { connect: { id: userId } };
      updateData.resolvedAt = new Date();
    }

    // If reopening, clear resolved info
    if (status === 'REOPENED') {
      updateData.resolvedBy = { disconnect: true };
      updateData.resolvedAt = null;
    }

    const bug = await prisma.bug.update({
      where: { id },
      data: updateData,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log status change
    await prisma.bugActivity.create({
      data: {
        bugId: id,
        userId,
        action: 'STATUS_CHANGED',
        field: 'status',
        oldValue: existing.status,
        newValue: status,
        comment,
      },
    });

    // Check if task still has open bugs
    const openBugsCount = await prisma.bug.count({
      where: {
        taskId: existing.taskId,
        status: { notIn: ['CLOSED'] },
      },
    });

    // Update task hasBugs flag
    await prisma.task.update({
      where: { id: existing.taskId },
      data: { hasBugs: openBugsCount > 0 },
    });

    return bug;
  }

  async assign(id: string, assignedToId: string, userId: string): Promise<any> {
    const existing = await prisma.bug.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Bug not found', 404);
    }

    const bug = await prisma.bug.update({
      where: { id },
      data: { assignedToId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log assignment
    await prisma.bugActivity.create({
      data: {
        bugId: id,
        userId,
        action: 'ASSIGNED',
        field: 'assignedTo',
        oldValue: existing.assignedToId || 'Unassigned',
        newValue: assignedToId,
      },
    });

    return bug;
  }

  async addComment(id: string, userId: string, comment: string): Promise<any> {
    const bug = await prisma.bug.findUnique({
      where: { id },
    });

    if (!bug) {
      throw new AppError('Bug not found', 404);
    }

    const activity = await prisma.bugActivity.create({
      data: {
        bugId: id,
        userId,
        action: 'COMMENT',
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return activity;
  }

  async delete(id: string): Promise<{ message: string }> {
    const bug = await prisma.bug.findUnique({
      where: { id },
    });

    if (!bug) {
      throw new AppError('Bug not found', 404);
    }

    await prisma.bug.delete({
      where: { id },
    });

    // Check if task still has bugs
    const remainingBugs = await prisma.bug.count({
      where: {
        taskId: bug.taskId,
        status: { notIn: ['CLOSED'] },
      },
    });

    // Update task hasBugs flag
    await prisma.task.update({
      where: { id: bug.taskId },
      data: { hasBugs: remainingBugs > 0 },
    });

    return { message: 'Bug deleted successfully' };
  }

  async getStats(projectId?: string): Promise<any> {
    const where: Prisma.BugWhereInput = projectId ? { projectId } : {};

    const [total, byStatus, bySeverity, openBugs] = await Promise.all([
      prisma.bug.count({ where }),
      prisma.bug.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.bug.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      prisma.bug.count({
        where: {
          ...where,
          status: { notIn: ['CLOSED'] },
        },
      }),
    ]);

    // Get critical/high open bugs
    const criticalHighOpen = await prisma.bug.count({
      where: {
        ...where,
        severity: { in: ['CRITICAL', 'HIGH'] },
        status: { notIn: ['CLOSED'] },
      },
    });

    return {
      total,
      open: openBugs,
      criticalHighOpen,
      byStatus: byStatus.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count }), {}),
      bySeverity: bySeverity.reduce((acc, curr) => ({ ...acc, [curr.severity]: curr._count }), {}),
    };
  }

  async getTrend(projectId?: string, days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where: Prisma.BugWhereInput = {
      createdAt: { gte: startDate },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const bugs = await prisma.bug.findMany({
      where,
      select: {
        severity: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trendMap = new Map<string, { opened: number; closed: number; critical: number; high: number }>();

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap.set(dateStr, { opened: 0, closed: 0, critical: 0, high: 0 });
    }

    bugs.forEach((bug) => {
      const dateStr = bug.createdAt.toISOString().split('T')[0];
      const entry = trendMap.get(dateStr);
      if (entry) {
        entry.opened++;
        if (bug.severity === 'CRITICAL') entry.critical++;
        else if (bug.severity === 'HIGH') entry.high++;
      }
    });

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
}

export const bugService = new BugService();
