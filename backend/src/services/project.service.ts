import { ProjectStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination } from '../utils/helpers.js';

export interface CreateProjectDTO {
  name: string;
  description?: string;
  clientId: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  isActive?: boolean;
}

export class ProjectService {
  async findAll(
    pagination: PaginationParams,
    filters?: { status?: ProjectStatus; clientId?: string; search?: string },
    userId?: string,
    userRole?: string
  ): Promise<PaginatedResponse<any>> {
    const where: Prisma.ProjectWhereInput = { isActive: true };

    // If developer, only show projects they're assigned to
    if (userRole === 'DEVELOPER' && userId) {
      where.members = {
        some: { userId },
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.project.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const projects = await prisma.project.findMany({
      where,
      skip,
      take,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            clientType: true,
          },
        },
        members: {
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
        },
        _count: {
          select: { tasks: true, members: true },
        },
      },
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder }
        : { createdAt: 'desc' },
    });

    // Get task status counts for each project
    const projectsWithTaskStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: { status: true },
        });

        const taskCounts = {
          total: project._count.tasks,
          todo: 0,
          inProgress: 0,
          inReview: 0,
          completed: 0,
          blocked: 0,
        };

        taskStats.forEach((stat) => {
          switch (stat.status) {
            case 'TODO':
              taskCounts.todo = stat._count.status;
              break;
            case 'IN_PROGRESS':
              taskCounts.inProgress = stat._count.status;
              break;
            case 'IN_REVIEW':
              taskCounts.inReview = stat._count.status;
              break;
            case 'COMPLETED':
              taskCounts.completed = stat._count.status;
              break;
            case 'BLOCKED':
              taskCounts.blocked = stat._count.status;
              break;
          }
        });

        return {
          ...project,
          taskCounts,
        };
      })
    );

    return {
      data: projectsWithTaskStats,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    };
  }

  async findById(id: string, userId?: string, userRole?: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                userType: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assigneeId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if developer has access
    if (userRole === 'DEVELOPER' && userId) {
      const isMember = project.members.some((m) => m.userId === userId);
      if (!isMember) {
        throw new AppError('Access denied', 403);
      }
    }

    return project;
  }

  async create(data: CreateProjectDTO) {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    const project = await prisma.project.create({
      data: {
        ...data,
        budget: data.budget,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    });

    return project;
  }

  async update(id: string, data: UpdateProjectDTO) {
    await this.findById(id);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        budget: data.budget,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        members: {
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
      },
    });

    return project;
  }

  async delete(id: string) {
    const project = await this.findById(id);

    if (project._count.tasks > 0) {
      throw new AppError('Cannot delete project with existing tasks', 400);
    }

    await prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  async addMember(projectId: string, userId: string, role = 'developer') {
    const project = await this.findById(projectId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existingMember = project.members.find((m) => m.userId === userId);
    if (existingMember) {
      throw new AppError('User is already a project member', 400);
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return member;
  }

  async removeMember(projectId: string, userId: string) {
    await this.findById(projectId);

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async getAll(userId?: string, userRole?: string) {
    const where: Prisma.ProjectWhereInput = { isActive: true };

    if (userRole === 'DEVELOPER' && userId) {
      where.members = {
        some: { userId },
      };
    }

    return prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const projectService = new ProjectService();
