import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { projectService } from '../services/project.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  clientId: z.string().uuid('Invalid client ID'),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive().optional().or(z.string().transform(v => v ? parseFloat(v) : undefined)),
  currency: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.string().optional(),
});

export class ProjectController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        status: req.query.status as any,
        clientId: req.query.clientId as string,
        search: req.query.search as string,
      };

      const result = await projectService.findAll(
        pagination,
        filters,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.findById(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.getAll(req.user!.userId, req.user!.role);
      sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createProjectSchema.parse(req.body);
      const project = await projectService.create({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      });
      sendSuccess(res, project, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateProjectSchema.parse(req.body);
      const project = await projectService.update(req.params.id, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      });
      sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await projectService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addMemberSchema.parse(req.body);
      const member = await projectService.addMember(req.params.id, data.userId, data.role);
      sendSuccess(res, member, 'Member added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await projectService.removeMember(req.params.id, req.params.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
