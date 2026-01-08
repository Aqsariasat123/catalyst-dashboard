import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { notificationService } from '../services/notification.service.js';
import { AuthRequest } from '../types/index.js';

const router = Router();

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.getUserNotifications(userId, unreadOnly);
    res.json({ data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ data: { count } });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notification = await notificationService.markAsRead(req.params.id, userId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.patch('/mark-all-read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

export default router;
