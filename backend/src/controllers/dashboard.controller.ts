import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { notificationService } from '../services/notification.service.js';
import { activityService } from '../services/activity.service.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess } from '../utils/helpers.js';

export class DashboardController {
  async getAdminDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getAdminDashboard();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getDeveloperDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getDeveloperDashboard(req.user!.userId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getMyDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role === 'DEVELOPER') {
        const stats = await dashboardService.getDeveloperDashboard(req.user!.userId);
        sendSuccess(res, stats);
      } else {
        const stats = await dashboardService.getAdminDashboard();
        sendSuccess(res, stats);
      }
    } catch (error) {
      next(error);
    }
  }

  async getDeveloperTimeReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.userId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const report = await dashboardService.getDeveloperTimeReport(userId, startDate, endDate);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getTeamOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await dashboardService.getTeamOverview();
      sendSuccess(res, team);
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.getUserNotifications(req.user!.userId, unreadOnly);
      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
      sendSuccess(res, notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      sendSuccess(res, { count });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await activityService.getRecentActivities(limit);
      sendSuccess(res, activities);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
