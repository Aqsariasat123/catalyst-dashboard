import { Response, NextFunction } from 'express';
import { qaDashboardService } from '../services/qaDashboard.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess } from '../utils/helpers.js';

export class QADashboardController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const data = await qaDashboardService.getDashboardData(projectId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getProjectStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await qaDashboardService.getProjectWiseStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await qaDashboardService.getRecentActivity(limit);
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }

  async getMilestoneStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await qaDashboardService.getMilestoneStats(req.params.milestoneId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getAutomationStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined;
      const stats = await qaDashboardService.getAutomationStats(projectId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const qaDashboardController = new QADashboardController();
