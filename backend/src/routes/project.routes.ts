import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED]
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', projectController.findAll.bind(projectController));

/**
 * @swagger
 * /api/projects/all:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects (dropdown list)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 */
router.get('/all', projectController.getAll.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
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
 *         description: Project details
 */
router.get('/:id', projectController.findById.bind(projectController));

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create new project (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, clientId]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               clientId:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/', isAdmin, projectController.create.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update project (Admin only)
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
 *         description: Project updated
 */
router.patch('/:id', isAdmin, projectController.update.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project (Admin only)
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
 *         description: Project deleted
 */
router.delete('/:id', isAdmin, projectController.delete.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     tags: [Projects]
 *     summary: Add member to project (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member added
 */
router.post('/:id/members', isAdmin, projectController.addMember.bind(projectController));

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Remove member from project (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 */
router.delete('/:id/members/:userId', isAdmin, projectController.removeMember.bind(projectController));

export default router;
