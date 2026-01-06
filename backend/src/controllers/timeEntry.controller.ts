import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { timeEntryService } from '../services/timeEntry.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, getPaginationParams } from '../utils/helpers.js';

const startTimerSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  notes: z.string().optional(),
});

const stopTimerSchema = z.object({
  timeEntryId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const createManualEntrySchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
  isBillable: z.boolean().optional(),
});

const updateTimeEntrySchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  notes: z.string().optional(),
  isBillable: z.boolean().optional(),
});

export class TimeEntryController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagination = getPaginationParams(req.query);
      const filters = {
        userId: req.query.userId as string,
        taskId: req.query.taskId as string,
        projectId: req.query.projectId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        isBillable: req.query.isBillable === 'true' ? true : req.query.isBillable === 'false' ? false : undefined,
      };

      // Developers can only see their own time entries
      if (req.user!.role === 'DEVELOPER') {
        filters.userId = req.user!.userId;
      }

      const result = await timeEntryService.findAll(pagination, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async startTimer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = startTimerSchema.parse(req.body);
      const entry = await timeEntryService.startTimer(
        req.user!.userId,
        data.taskId,
        data.notes,
        req.user!.role
      );
      sendSuccess(res, entry, 'Timer started', 201);
    } catch (error) {
      next(error);
    }
  }

  async stopTimer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = stopTimerSchema.parse(req.body);
      const entry = await timeEntryService.stopTimer(req.user!.userId, data.timeEntryId, data.notes);
      sendSuccess(res, entry, 'Timer stopped');
    } catch (error) {
      next(error);
    }
  }

  async getActiveTimer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const timer = await timeEntryService.getActiveTimer(req.user!.userId);
      sendSuccess(res, timer);
    } catch (error) {
      next(error);
    }
  }

  async createManualEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createManualEntrySchema.parse(req.body);
      const entry = await timeEntryService.createManualEntry(req.user!.userId, {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      });
      sendSuccess(res, entry, 'Time entry created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateTimeEntrySchema.parse(req.body);
      const entry = await timeEntryService.update(req.params.id, req.user!.userId, {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      });
      sendSuccess(res, entry, 'Time entry updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'PROJECT_MANAGER';
      const result = await timeEntryService.delete(req.params.id, req.user!.userId, isAdmin);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTimeStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.userId;

      // Developers can only see their own stats
      if (req.user!.role === 'DEVELOPER' && userId !== req.user!.userId) {
        sendSuccess(res, null, 'Access denied');
        return;
      }

      const stats = await timeEntryService.getUserTimeStats(userId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getProjectTimeReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await timeEntryService.getProjectTimeReport(req.params.projectId);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
}

export const timeEntryController = new TimeEntryController();
