import { TestCaseStatus, TestCasePriority, TestCaseType, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination } from '../utils/helpers.js';

export interface CreateTestCaseDTO {
  title: string;
  description?: string;
  steps: Array<{ step: string; expected: string }>;
  expectedResult: string;
  preconditions?: string;
  priority?: TestCasePriority;
  type?: TestCaseType;
  status?: TestCaseStatus;
  taskId: string;
  projectId: string;
  milestoneId?: string;
}

export interface UpdateTestCaseDTO extends Partial<Omit<CreateTestCaseDTO, 'projectId' | 'taskId'>> {}

export interface TestCaseFilters {
  projectId?: string;
  milestoneId?: string;
  taskId?: string;
  status?: TestCaseStatus;
  priority?: TestCasePriority;
  type?: TestCaseType;
  search?: string;
  createdById?: string;
}

export class TestCaseService {
  async findAll(
    pagination: PaginationParams,
    filters?: TestCaseFilters,
    userId?: string,
    userRole?: string
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.TestCaseWhereInput = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.milestoneId) {
      where.milestoneId = filters.milestoneId;
    }

    if (filters?.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.testCase.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const testCases = await prisma.testCase.findMany({
      where,
      skip,
      take,
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            executions: true,
            bugs: true,
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get last execution status for each test case
    const testCasesWithLastExecution = await Promise.all(
      testCases.map(async (tc) => {
        const lastExecution = await prisma.testExecution.findFirst({
          where: { testCaseId: tc.id },
          orderBy: { executedAt: 'desc' },
          select: {
            id: true,
            status: true,
            executedAt: true,
          },
        });
        return {
          ...tc,
          lastExecution,
        };
      })
    );

    return {
      data: testCasesWithLastExecution,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<any> {
    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        executions: {
          include: {
            executedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            attachments: true,
          },
          orderBy: { executedAt: 'desc' },
          take: 10,
        },
        bugs: {
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
        },
        attachments: true,
      },
    });

    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }

    return testCase;
  }

  async getByTask(taskId: string): Promise<any[]> {
    return prisma.testCase.findMany({
      where: { taskId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            executions: true,
            bugs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByProject(projectId: string): Promise<any[]> {
    return prisma.testCase.findMany({
      where: { projectId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
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
            executions: true,
            bugs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateTestCaseDTO, userId: string): Promise<any> {
    // Verify task exists and belongs to the project
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      select: { projectId: true, milestoneId: true },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.projectId !== data.projectId) {
      throw new AppError('Task does not belong to the specified project', 400);
    }

    const testCase = await prisma.testCase.create({
      data: {
        title: data.title,
        description: data.description,
        steps: data.steps,
        expectedResult: data.expectedResult,
        preconditions: data.preconditions,
        priority: data.priority || 'MEDIUM',
        type: data.type || 'MANUAL',
        status: data.status || 'ACTIVE',
        taskId: data.taskId,
        projectId: data.projectId,
        milestoneId: data.milestoneId || task.milestoneId,
        createdById: userId,
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return testCase;
  }

  async update(id: string, data: UpdateTestCaseDTO, userId: string): Promise<any> {
    const existing = await prisma.testCase.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Test case not found', 404);
    }

    const testCase = await prisma.testCase.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        steps: data.steps,
        expectedResult: data.expectedResult,
        preconditions: data.preconditions,
        priority: data.priority,
        type: data.type,
        status: data.status,
        milestoneId: data.milestoneId,
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return testCase;
  }

  async delete(id: string): Promise<{ message: string }> {
    const testCase = await prisma.testCase.findUnique({
      where: { id },
    });

    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }

    await prisma.testCase.delete({
      where: { id },
    });

    return { message: 'Test case deleted successfully' };
  }

  async getStats(projectId?: string): Promise<any> {
    const where: Prisma.TestCaseWhereInput = projectId ? { projectId } : {};

    const [total, byStatus, byPriority, byType] = await Promise.all([
      prisma.testCase.count({ where }),
      prisma.testCase.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.testCase.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      prisma.testCase.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count }), {}),
      byPriority: byPriority.reduce((acc, curr) => ({ ...acc, [curr.priority]: curr._count }), {}),
      byType: byType.reduce((acc, curr) => ({ ...acc, [curr.type]: curr._count }), {}),
    };
  }
}

export const testCaseService = new TestCaseService();
