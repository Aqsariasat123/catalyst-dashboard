import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { taskService } from '../services/task.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().uuid('Invalid project ID'),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED']).optional(),
  estimatedHours: z.number().positive().optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = createTaskSchema.omit({ projectId: true }).partial();

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

const reviewTaskSchema = z.object({
  reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES']),
  reviewComment: z.string().optional(),
  hasBugs: z.boolean().optional(),
});

export class TaskController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        projectId: req.query.projectId as string,
        assigneeId: req.query.assigneeId as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        search: req.query.search as string,
      };

      const result = await taskService.findAll(
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
      const task = await taskService.findById(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.getMyTasks(req.user!.userId);
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  async getByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.getTasksByProject(req.params.projectId);
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await taskService.create(
        {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
        req.user!.userId
      );
      sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateTaskSchema.parse(req.body);
      const task = await taskService.update(
        req.params.id,
        {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addCommentSchema.parse(req.body);
      const comment = await taskService.addComment(
        req.params.id,
        req.user!.userId,
        data.content
      );
      sendSuccess(res, comment, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async reviewTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = reviewTaskSchema.parse(req.body);
      const task = await taskService.reviewTask(
        req.params.id,
        req.user!.userId,
        data
      );
      sendSuccess(res, task, 'Task reviewed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTasksForReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const tasks = await taskService.getTasksForReview(projectId);
      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
