import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate, isAdmin, isQC } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks
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
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, BLOCKED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', taskController.findAll.bind(taskController));

/**
 * @swagger
 * /api/tasks/my:
 *   get:
 *     tags: [Tasks]
 *     summary: Get my assigned tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my tasks
 */
router.get('/my', taskController.getMyTasks.bind(taskController));

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks by project
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
 *         description: List of project tasks
 */
router.get('/project/:projectId', taskController.getByProject.bind(taskController));

/**
 * @swagger
 * /api/tasks/review/pending:
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks pending review (QC only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project
 *     responses:
 *       200:
 *         description: List of tasks pending review
 */
router.get('/review/pending', isQC, taskController.getTasksForReview.bind(taskController));

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
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
 *         description: Task details
 */
router.get('/:id', taskController.findById.bind(taskController));

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create new task (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, projectId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               priority:
 *                 type: string
 *               estimatedHours:
 *                 type: number
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', isAdmin, taskController.create.bind(taskController));

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task
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
 *         description: Task updated
 */
router.patch('/:id', taskController.update.bind(taskController));

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task (Admin only)
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
 *         description: Task deleted
 */
router.delete('/:id', isAdmin, taskController.delete.bind(taskController));

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     tags: [Tasks]
 *     summary: Add comment to task
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/:id/comments', taskController.addComment.bind(taskController));

/**
 * @swagger
 * /api/tasks/{id}/review:
 *   post:
 *     tags: [Tasks]
 *     summary: Review a task (QC only)
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
 *             required: [reviewStatus]
 *             properties:
 *               reviewStatus:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED, NEEDS_CHANGES]
 *               reviewComment:
 *                 type: string
 *               hasBugs:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task reviewed successfully
 */
router.post('/:id/review', isQC, taskController.reviewTask.bind(taskController));

export default router;
