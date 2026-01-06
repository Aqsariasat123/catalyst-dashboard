import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard based on user role
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get('/', dashboardController.getMyDashboard.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get admin dashboard (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 */
router.get('/admin', isAdmin, dashboardController.getAdminDashboard.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/developer:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get developer dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Developer dashboard data
 */
router.get('/developer', dashboardController.getDeveloperDashboard.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/time-report:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get time report for current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Time report
 */
router.get('/time-report', dashboardController.getDeveloperTimeReport.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/time-report/{userId}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get time report for specific user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Time report
 */
router.get('/time-report/:userId', isAdmin, dashboardController.getDeveloperTimeReport.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/team:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get team overview (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team overview
 */
router.get('/team', isAdmin, dashboardController.getTeamOverview.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/notifications:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/notifications', dashboardController.getNotifications.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/notifications/unread-count:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/notifications/unread-count', dashboardController.getUnreadCount.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/notifications/{id}/read:
 *   post:
 *     tags: [Dashboard]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post('/notifications/:id/read', dashboardController.markNotificationRead.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/notifications/read-all:
 *   post:
 *     tags: [Dashboard]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post('/notifications/read-all', dashboardController.markAllNotificationsRead.bind(dashboardController));

/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activities (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of recent activities
 */
router.get('/activities', isAdmin, dashboardController.getRecentActivities.bind(dashboardController));

export default router;
