import bcrypt from 'bcryptjs';
import { UserRole, UserType, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination, excludeFields } from '../utils/helpers.js';

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  userType: UserType;
  phone?: string;
  hourlyRate?: number;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  userType?: UserType;
  phone?: string;
  hourlyRate?: number;
  isActive?: boolean;
}

export class UserService {
  async findAll(
    pagination: PaginationParams,
    filters?: { role?: UserRole; userType?: UserType; search?: string }
  ): Promise<PaginatedResponse<Omit<Prisma.UserGetPayload<{}>, 'password'>>> {
    const where: Prisma.UserWhereInput = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.userType) {
      where.userType = filters.userType;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.user.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder }
        : { createdAt: 'desc' },
    });

    const usersWithoutPassword = users.map((user) => excludeFields(user, ['password']));

    return {
      data: usersWithoutPassword,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedTasks: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return excludeFields(user, ['password']);
  }

  async getDevelopers() {
    const developers = await prisma.user.findMany({
      where: {
        role: 'DEVELOPER',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        avatar: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return developers;
  }

  async create(data: CreateUserDTO) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        hourlyRate: data.hourlyRate,
      },
    });

    return excludeFields(user, ['password']);
  }

  async update(id: string, data: UpdateUserDTO) {
    await this.findById(id);

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return excludeFields(user, ['password']);
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async deactivate(id: string) {
    await this.findById(id);

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return excludeFields(user, ['password']);
  }
}

export const userService = new UserService();
