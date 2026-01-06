import { ClientType, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PaginationParams, PaginatedResponse } from '../types/index.js';
import { calculatePagination } from '../utils/helpers.js';

export interface CreateClientDTO {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  clientType: ClientType;
  upworkProfile?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
  isActive?: boolean;
}

export class ClientService {
  async findAll(
    pagination: PaginationParams,
    filters?: { clientType?: ClientType; search?: string; isActive?: boolean }
  ): Promise<PaginatedResponse<Prisma.ClientGetPayload<{ include: { _count: { select: { projects: true } } } }>>> {
    const where: Prisma.ClientWhereInput = {};

    if (filters?.clientType) {
      where.clientType = filters.clientType;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.client.count({ where });
    const { skip, take, totalPages } = calculatePagination(total, pagination.page, pagination.limit);

    const clients = await prisma.client.findMany({
      where,
      skip,
      take,
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: pagination.sortBy
        ? { [pagination.sortBy]: pagination.sortOrder }
        : { createdAt: 'desc' },
    });

    return {
      data: clients,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    };
  }

  async findById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            _count: {
              select: { tasks: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    return client;
  }

  async create(data: CreateClientDTO) {
    const client = await prisma.client.create({
      data,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    return client;
  }

  async update(id: string, data: UpdateClientDTO) {
    await this.findById(id);

    const client = await prisma.client.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    return client;
  }

  async delete(id: string) {
    const client = await this.findById(id);

    if (client._count.projects > 0) {
      throw new AppError('Cannot delete client with existing projects', 400);
    }

    await prisma.client.delete({
      where: { id },
    });

    return { message: 'Client deleted successfully' };
  }

  async getAll() {
    return prisma.client.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        company: true,
        clientType: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const clientService = new ClientService();
