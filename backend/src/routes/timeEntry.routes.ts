import { Router } from 'express';
import { timeEntryController } from '../controllers/timeEntry.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/time-entries:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get all time entries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
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
 *         description: List of time entries
 */
router.get('/', timeEntryController.findAll.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/active:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get active timer (legacy - single timer)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active timer or null
 */
router.get('/active', timeEntryController.getActiveTimer.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/active-all:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get all active timers (supports multiple concurrent timers)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of active timers
 */
router.get('/active-all', timeEntryController.getActiveTimers.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/stats:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get user time stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User time statistics
 */
router.get('/stats', timeEntryController.getUserTimeStats.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/stats/{userId}:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get specific user time stats (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User time statistics
 */
router.get('/stats/:userId', isAdmin, timeEntryController.getUserTimeStats.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/project/{projectId}/report:
 *   get:
 *     tags: [Time Entries]
 *     summary: Get project time report (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project time report
 */
router.get('/project/:projectId/report', isAdmin, timeEntryController.getProjectTimeReport.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/start:
 *   post:
 *     tags: [Time Entries]
 *     summary: Start timer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId]
 *             properties:
 *               taskId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Timer started
 */
router.post('/start', timeEntryController.startTimer.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/stop:
 *   post:
 *     tags: [Time Entries]
 *     summary: Stop timer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeEntryId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Timer stopped
 */
router.post('/stop', timeEntryController.stopTimer.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/stop/{taskId}:
 *   post:
 *     tags: [Time Entries]
 *     summary: Stop timer for a specific task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Timer stopped
 */
router.post('/stop/:taskId', timeEntryController.stopTimerByTask.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/manual:
 *   post:
 *     tags: [Time Entries]
 *     summary: Create manual time entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [taskId, startTime, endTime]
 *             properties:
 *               taskId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               isBillable:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Time entry created
 */
router.post('/manual', timeEntryController.createManualEntry.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/{id}:
 *   patch:
 *     tags: [Time Entries]
 *     summary: Update time entry
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
 *         description: Time entry updated
 */
router.patch('/:id', timeEntryController.update.bind(timeEntryController));

/**
 * @swagger
 * /api/time-entries/{id}:
 *   delete:
 *     tags: [Time Entries]
 *     summary: Delete time entry
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
 *         description: Time entry deleted
 */
router.delete('/:id', timeEntryController.delete.bind(timeEntryController));

export default router;
