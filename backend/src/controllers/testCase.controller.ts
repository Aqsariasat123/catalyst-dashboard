import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { testCaseService } from '../services/testCase.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createTestCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  steps: z.array(z.object({
    step: z.string().min(1),
    expected: z.string().min(1),
  })).min(1, 'At least one step is required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  preconditions: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  type: z.enum(['MANUAL', 'AUTOMATION']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED']).optional(),
  taskId: z.string().uuid('Invalid task ID'),
  projectId: z.string().uuid('Invalid project ID'),
  milestoneId: z.string().uuid().optional().nullable(),
});

const updateTestCaseSchema = createTestCaseSchema.omit({ taskId: true, projectId: true }).partial();

export class TestCaseController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        projectId: req.query.projectId as string,
        milestoneId: req.query.milestoneId as string,
        taskId: req.query.taskId as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        type: req.query.type as any,
        search: req.query.search as string,
        createdById: req.query.createdById as string,
      };

      const result = await testCaseService.findAll(
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
      const testCase = await testCaseService.findById(req.params.id);
      sendSuccess(res, testCase);
    } catch (error) {
      next(error);
    }
  }

  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const testCases = await testCaseService.getByTask(req.params.taskId);
      sendSuccess(res, testCases);
    } catch (error) {
      next(error);
    }
  }

  async getByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const testCases = await testCaseService.getByProject(req.params.projectId);
      sendSuccess(res, testCases);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createTestCaseSchema.parse(req.body);
      const testCase = await testCaseService.create(
        {
          ...data,
          milestoneId: data.milestoneId || undefined,
        },
        req.user!.userId
      );
      sendSuccess(res, testCase, 'Test case created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateTestCaseSchema.parse(req.body);
      const testCase = await testCaseService.update(
        req.params.id,
        {
          ...data,
          milestoneId: data.milestoneId || undefined,
        },
        req.user!.userId
      );
      sendSuccess(res, testCase, 'Test case updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await testCaseService.delete(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const stats = await testCaseService.getStats(projectId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const testCaseController = new TestCaseController();
