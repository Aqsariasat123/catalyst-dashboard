import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { bugService } from '../services/bug.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createBugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  stepsToReproduce: z.string().optional(),
  environment: z.string().optional(),
  actualResult: z.string().optional(),
  expectedResult: z.string().optional(),
  testCaseId: z.string().uuid().optional().nullable(),
  testExecutionId: z.string().uuid().optional().nullable(),
  taskId: z.string().uuid('Invalid task ID'),
  projectId: z.string().uuid('Invalid project ID'),
  milestoneId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

const updateBugSchema = createBugSchema
  .omit({ taskId: true, projectId: true })
  .partial()
  .extend({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'FIXED', 'RETEST', 'CLOSED', 'REOPENED']).optional(),
    resolution: z.string().optional(),
  });

const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'FIXED', 'RETEST', 'CLOSED', 'REOPENED']),
  comment: z.string().optional(),
});

const assignBugSchema = z.object({
  assignedToId: z.string().uuid('Invalid user ID'),
});

const addCommentSchema = z.object({
  comment: z.string().min(1, 'Comment is required'),
});

export class BugController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        projectId: req.query.projectId as string,
        milestoneId: req.query.milestoneId as string,
        taskId: req.query.taskId as string,
        testCaseId: req.query.testCaseId as string,
        status: req.query.status as any,
        severity: req.query.severity as any,
        reportedById: req.query.reportedById as string,
        assignedToId: req.query.assignedToId as string,
        search: req.query.search as string,
      };

      const result = await bugService.findAll(pagination, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bug = await bugService.findById(req.params.id);
      sendSuccess(res, bug);
    } catch (error) {
      next(error);
    }
  }

  async getByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bugs = await bugService.getByProject(req.params.projectId);
      sendSuccess(res, bugs);
    } catch (error) {
      next(error);
    }
  }

  async getByTestCase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bugs = await bugService.getByTestCase(req.params.testCaseId);
      sendSuccess(res, bugs);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createBugSchema.parse(req.body);
      const bug = await bugService.create(
        {
          ...data,
          testCaseId: data.testCaseId || undefined,
          testExecutionId: data.testExecutionId || undefined,
          milestoneId: data.milestoneId || undefined,
          assignedToId: data.assignedToId || undefined,
        },
        req.user!.userId
      );
      sendSuccess(res, bug, 'Bug created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateBugSchema.parse(req.body);
      const bug = await bugService.update(
        req.params.id,
        {
          ...data,
          testCaseId: data.testCaseId || undefined,
          testExecutionId: data.testExecutionId || undefined,
          milestoneId: data.milestoneId || undefined,
          assignedToId: data.assignedToId || undefined,
        },
        req.user!.userId
      );
      sendSuccess(res, bug, 'Bug updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateStatusSchema.parse(req.body);
      const bug = await bugService.updateStatus(
        req.params.id,
        data.status,
        req.user!.userId,
        data.comment
      );
      sendSuccess(res, bug, 'Bug status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = assignBugSchema.parse(req.body);
      const bug = await bugService.assign(req.params.id, data.assignedToId, req.user!.userId);
      sendSuccess(res, bug, 'Bug assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addCommentSchema.parse(req.body);
      const activity = await bugService.addComment(req.params.id, req.user!.userId, data.comment);
      sendSuccess(res, activity, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await bugService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const stats = await bugService.getStats(projectId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const days = parseInt(req.query.days as string) || 7;
      const trend = await bugService.getTrend(projectId, days);
      sendSuccess(res, trend);
    } catch (error) {
      next(error);
    }
  }
}

export const bugController = new BugController();
