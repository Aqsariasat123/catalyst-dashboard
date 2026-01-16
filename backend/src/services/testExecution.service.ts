import { ExecutionStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination } from '../utils/helpers.js';

export interface CreateExecutionDTO {
  testCaseId: string;
  status: ExecutionStatus;
  notes?: string;
  executionTime?: number;
  milestoneId?: string;
  stepResults?: Array<{ stepIndex: number; passed: boolean; notes?: string }>;
}

export interface UpdateExecutionDTO {
  status?: ExecutionStatus;
  notes?: string;
  executionTime?: number;
  stepResults?: Array<{ stepIndex: number; passed: boolean; notes?: string }>;
}

export interface ExecutionFilters {
  testCaseId?: string;
  projectId?: string;
  milestoneId?: string;
  status?: ExecutionStatus;
  executedById?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class TestExecutionService {
  async findAll(
    pagination: PaginationParams,
    filters?: ExecutionFilters
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.TestExecutionWhereInput = {};

    if (filters?.testCaseId) {
      where.testCaseId = filters.testCaseId;
    }

    if (filters?.projectId) {
      where.testCase = { projectId: filters.projectId };
    }

    if (filters?.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.executedById) {
      where.executedById = filters.executedById;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.executedAt = {};
      if (filters.dateFrom) {
        where.executedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.executedAt.lte = filters.dateTo;
      }
    }

    const total = await prisma.testExecution.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const executions = await prisma.testExecution.findMany({
      where,
      skip,
      take,
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
            priority: true,
            type: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        executedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
        attachments: true,
      },
      orderBy: { executedAt: 'desc' },
    });

    return {
      data: executions,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<any> {
    const execution = await prisma.testExecution.findUnique({
      where: { id },
      include: {
        testCase: {
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
            task: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        executedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
        attachments: true,
      },
    });

    if (!execution) {
      throw new AppError('Test execution not found', 404);
    }

    return execution;
  }

  async getHistory(testCaseId: string): Promise<any[]> {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }

    return prisma.testExecution.findMany({
      where: { testCaseId },
      include: {
        executedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
        attachments: true,
      },
      orderBy: { executedAt: 'desc' },
    });
  }

  async execute(data: CreateExecutionDTO, userId: string): Promise<any> {
    const testCase = await prisma.testCase.findUnique({
      where: { id: data.testCaseId },
      select: { milestoneId: true },
    });

    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }

    // Get the next run number
    const lastExecution = await prisma.testExecution.findFirst({
      where: { testCaseId: data.testCaseId },
      orderBy: { runNumber: 'desc' },
      select: { runNumber: true },
    });

    const runNumber = (lastExecution?.runNumber || 0) + 1;

    const execution = await prisma.testExecution.create({
      data: {
        testCaseId: data.testCaseId,
        status: data.status,
        notes: data.notes,
        executionTime: data.executionTime,
        milestoneId: data.milestoneId || testCase.milestoneId,
        stepResults: data.stepResults,
        runNumber,
        executedById: userId,
      },
      include: {
        testCase: {
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
        executedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return execution;
  }

  async bulkExecute(
    testCaseIds: string[],
    status: ExecutionStatus,
    userId: string,
    milestoneId?: string
  ): Promise<any[]> {
    const results: any[] = [];

    for (const testCaseId of testCaseIds) {
      try {
        const execution = await this.execute(
          {
            testCaseId,
            status,
            milestoneId,
          },
          userId
        );
        results.push(execution);
      } catch (error) {
        results.push({
          testCaseId,
          error: error instanceof Error ? error.message : 'Failed to execute',
        });
      }
    }

    return results;
  }

  async update(id: string, data: UpdateExecutionDTO): Promise<any> {
    const existing = await prisma.testExecution.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Test execution not found', 404);
    }

    const execution = await prisma.testExecution.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        executionTime: data.executionTime,
        stepResults: data.stepResults,
      },
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
          },
        },
        executedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return execution;
  }

  async getStats(projectId?: string, milestoneId?: string): Promise<any> {
    const where: Prisma.TestExecutionWhereInput = {};

    if (projectId) {
      where.testCase = { projectId };
    }

    if (milestoneId) {
      where.milestoneId = milestoneId;
    }

    const [total, byStatus, recentExecutions] = await Promise.all([
      prisma.testExecution.count({ where }),
      prisma.testExecution.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.testExecution.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        take: 10,
        include: {
          testCase: {
            select: {
              id: true,
              title: true,
            },
          },
          executedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc, curr) => ({ ...acc, [curr.status]: curr._count }),
      { NOT_RUN: 0, PASS: 0, FAIL: 0, BLOCKED: 0, SKIPPED: 0 }
    );

    const passRate =
      total > 0
        ? Math.round(((statusCounts.PASS || 0) / (total - (statusCounts.NOT_RUN || 0))) * 100) || 0
        : 0;

    return {
      total,
      byStatus: statusCounts,
      passRate,
      recentExecutions,
    };
  }

  async getTrend(projectId?: string, days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where: Prisma.TestExecutionWhereInput = {
      executedAt: { gte: startDate },
    };

    if (projectId) {
      where.testCase = { projectId };
    }

    const executions = await prisma.testExecution.findMany({
      where,
      select: {
        status: true,
        executedAt: true,
      },
      orderBy: { executedAt: 'asc' },
    });

    // Group by date
    const trendMap = new Map<string, { pass: number; fail: number; blocked: number; total: number }>();

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap.set(dateStr, { pass: 0, fail: 0, blocked: 0, total: 0 });
    }

    executions.forEach((exec) => {
      const dateStr = exec.executedAt.toISOString().split('T')[0];
      const entry = trendMap.get(dateStr);
      if (entry) {
        entry.total++;
        if (exec.status === 'PASS') entry.pass++;
        else if (exec.status === 'FAIL') entry.fail++;
        else if (exec.status === 'BLOCKED') entry.blocked++;
      }
    });

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }
}

export const testExecutionService = new TestExecutionService();
