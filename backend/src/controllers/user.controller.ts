import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/user.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']),
  userType: z.enum(['INHOUSE', 'FREELANCER']),
  phone: z.string().optional(),
  hourlyRate: z.number().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']).optional(),
  userType: z.enum(['INHOUSE', 'FREELANCER']).optional(),
  phone: z.string().optional(),
  hourlyRate: z.number().optional(),
  isActive: z.boolean().optional(),
});

export class UserController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        role: req.query.role as any,
        userType: req.query.userType as any,
        search: req.query.search as string,
      };

      const result = await userService.findAll(pagination, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async getDevelopers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const developers = await userService.getDevelopers();
      sendSuccess(res, developers);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.create(data);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await userService.update(req.params.id, data);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.deactivate(req.params.id);
      sendSuccess(res, user, 'User deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
