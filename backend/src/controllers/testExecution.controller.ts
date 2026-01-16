import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { testExecutionService } from '../services/testExecution.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const createExecutionSchema = z.object({
  testCaseId: z.string().uuid('Invalid test case ID'),
  status: z.enum(['NOT_RUN', 'PASS', 'FAIL', 'BLOCKED', 'SKIPPED']),
  notes: z.string().optional(),
  executionTime: z.number().int().positive().optional(),
  milestoneId: z.string().uuid().optional().nullable(),
  stepResults: z.array(z.object({
    stepIndex: z.number().int().min(0),
    passed: z.boolean(),
    notes: z.string().optional(),
  })).optional(),
});

const updateExecutionSchema = createExecutionSchema.omit({ testCaseId: true }).partial();

const bulkExecuteSchema = z.object({
  testCaseIds: z.array(z.string().uuid()).min(1, 'At least one test case ID is required'),
  status: z.enum(['NOT_RUN', 'PASS', 'FAIL', 'BLOCKED', 'SKIPPED']),
  milestoneId: z.string().uuid().optional().nullable(),
});

export class TestExecutionController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        testCaseId: req.query.testCaseId as string,
        projectId: req.query.projectId as string,
        milestoneId: req.query.milestoneId as string,
        status: req.query.status as any,
        executedById: req.query.executedById as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      };

      const result = await testExecutionService.findAll(pagination, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const execution = await testExecutionService.findById(req.params.id);
      sendSuccess(res, execution);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await testExecutionService.getHistory(req.params.testCaseId);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  async execute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createExecutionSchema.parse(req.body);
      const execution = await testExecutionService.execute(
        {
          ...data,
          milestoneId: data.milestoneId || undefined,
        },
        req.user!.userId
      );
      sendSuccess(res, execution, 'Test executed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async bulkExecute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = bulkExecuteSchema.parse(req.body);
      const results = await testExecutionService.bulkExecute(
        data.testCaseIds,
        data.status,
        req.user!.userId,
        data.milestoneId || undefined
      );
      sendSuccess(res, results, 'Bulk execution completed', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateExecutionSchema.parse(req.body);
      const execution = await testExecutionService.update(req.params.id, data);
      sendSuccess(res, execution, 'Execution updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const milestoneId = req.query.milestoneId as string | undefined;
      const stats = await testExecutionService.getStats(projectId, milestoneId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const days = parseInt(req.query.days as string) || 7;
      const trend = await testExecutionService.getTrend(projectId, days);
      sendSuccess(res, trend);
    } catch (error) {
      next(error);
    }
  }
}

export const testExecutionController = new TestExecutionController();
