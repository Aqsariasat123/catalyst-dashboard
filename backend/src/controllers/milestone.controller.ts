import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { milestoneService } from '../services/milestone.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess } from '../utils/helpers.js';

const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().positive().optional().or(z.string().transform(v => v ? parseFloat(v) : undefined)),
  currency: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().optional(),
  paymentStatus: z.string().optional().transform(v => {
    if (!v || v === '') return null;
    if (['PENDING', 'IN_PROGRESS', 'RELEASED', 'DELAYED', 'CANCELLED'].includes(v)) {
      return v as 'PENDING' | 'IN_PROGRESS' | 'RELEASED' | 'DELAYED' | 'CANCELLED';
    }
    return null;
  }),
});

const updateMilestoneSchema = createMilestoneSchema.partial();

export class MilestoneController {
  async findByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const milestones = await milestoneService.findByProject(
        req.params.projectId,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, milestones);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const milestone = await milestoneService.findById(req.params.id);
      sendSuccess(res, milestone);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createMilestoneSchema.parse(req.body);
      const milestone = await milestoneService.create(req.params.projectId, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      sendSuccess(res, milestone, 'Milestone created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log('Raw request body:', JSON.stringify(req.body));
      const data = updateMilestoneSchema.parse(req.body);
      console.log('Parsed data:', JSON.stringify(data));
      const milestone = await milestoneService.update(req.params.id, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      sendSuccess(res, milestone, 'Milestone updated successfully');
    } catch (error) {
      console.log('Error in milestone update:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await milestoneService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const milestoneController = new MilestoneController();
