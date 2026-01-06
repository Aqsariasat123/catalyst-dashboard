import { Router } from 'express';
import { milestoneController } from '../controllers/milestone.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   get:
 *     tags: [Milestones]
 *     summary: Get all milestones for a project
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
 *         description: List of milestones with tasks
 */
router.get('/projects/:projectId/milestones', milestoneController.findByProject.bind(milestoneController));

/**
 * @swagger
 * /api/milestones/{id}:
 *   get:
 *     tags: [Milestones]
 *     summary: Get milestone by ID
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
 *         description: Milestone details with tasks
 */
router.get('/milestones/:id', milestoneController.findById.bind(milestoneController));

/**
 * @swagger
 * /api/projects/{projectId}/milestones:
 *   post:
 *     tags: [Milestones]
 *     summary: Create new milestone (Admin/PM only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
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
 *                 enum: [NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Milestone created
 */
router.post('/projects/:projectId/milestones', isAdmin, milestoneController.create.bind(milestoneController));

/**
 * @swagger
 * /api/milestones/{id}:
 *   patch:
 *     tags: [Milestones]
 *     summary: Update milestone (Admin/PM only)
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
 *         description: Milestone updated
 */
router.patch('/milestones/:id', isAdmin, milestoneController.update.bind(milestoneController));

/**
 * @swagger
 * /api/milestones/{id}:
 *   delete:
 *     tags: [Milestones]
 *     summary: Delete milestone (Admin/PM only)
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
 *         description: Milestone deleted
 */
router.delete('/milestones/:id', isAdmin, milestoneController.delete.bind(milestoneController));

export default router;
