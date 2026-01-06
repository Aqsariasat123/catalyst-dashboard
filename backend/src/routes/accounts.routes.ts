import { Router } from 'express';
import { accountsController } from '../controllers/accounts.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(isAdmin); // All accounts routes require admin access

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     tags: [Accounts]
 *     summary: Get accounts overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts overview data
 */
router.get('/', accountsController.getOverview.bind(accountsController));

/**
 * @swagger
 * /api/accounts/projects/{projectId}:
 *   get:
 *     tags: [Accounts]
 *     summary: Get detailed account info for a project
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
 *         description: Project account details
 */
router.get('/projects/:projectId', accountsController.getProjectDetails.bind(accountsController));

/**
 * @swagger
 * /api/accounts/projects/{projectId}/financials:
 *   get:
 *     tags: [Accounts]
 *     summary: Get comprehensive financial info for a project
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
 *         description: Project financial details including cost breakdown, task costs, and role breakdown
 */
router.get('/projects/:projectId/financials', accountsController.getProjectFinancials.bind(accountsController));

/**
 * @swagger
 * /api/accounts/projects/{projectId}/financials:
 *   put:
 *     tags: [Accounts]
 *     summary: Update project financial settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platformFeePercent:
 *                 type: number
 *               workingBudget:
 *                 type: number
 *               exchangeRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Project financial settings updated
 */
router.put('/projects/:projectId/financials', accountsController.updateProjectFinancials.bind(accountsController));

/**
 * @swagger
 * /api/accounts/developers/{developerId}:
 *   get:
 *     tags: [Accounts]
 *     summary: Get detailed account info for a developer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: developerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer account details
 */
router.get('/developers/:developerId', accountsController.getDeveloperDetails.bind(accountsController));

/**
 * @swagger
 * /api/accounts/milestones:
 *   get:
 *     tags: [Accounts]
 *     summary: Get all milestones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of milestones
 */
router.get('/milestones', accountsController.getMilestones.bind(accountsController));

/**
 * @swagger
 * /api/accounts/milestones:
 *   post:
 *     tags: [Accounts]
 *     summary: Create a new milestone
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *               - amount
 *             properties:
 *               projectId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Milestone created
 */
router.post('/milestones', accountsController.createMilestone.bind(accountsController));

/**
 * @swagger
 * /api/accounts/milestones/{id}:
 *   put:
 *     tags: [Accounts]
 *     summary: Update a milestone
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, RELEASED, CANCELLED]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Milestone updated
 */
router.put('/milestones/:id', accountsController.updateMilestone.bind(accountsController));

/**
 * @swagger
 * /api/accounts/milestones/{id}:
 *   delete:
 *     tags: [Accounts]
 *     summary: Delete a milestone
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Milestone deleted
 */
router.delete('/milestones/:id', accountsController.deleteMilestone.bind(accountsController));

/**
 * @swagger
 * /api/accounts/time-breakdown:
 *   get:
 *     tags: [Accounts]
 *     summary: Get time breakdown by project and task
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Time breakdown data
 */
router.get('/time-breakdown', accountsController.getTimeBreakdown.bind(accountsController));

export default router;
