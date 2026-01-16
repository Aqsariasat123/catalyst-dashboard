import { Router } from 'express';
import { testCaseController } from '../controllers/testCase.controller.js';
import { testExecutionController } from '../controllers/testExecution.controller.js';
import { bugController } from '../controllers/bug.controller.js';
import { qaAttachmentController } from '../controllers/qaAttachment.controller.js';
import { qaDashboardController } from '../controllers/qaDashboard.controller.js';
import { authenticate, isQC, isAdmin } from '../middleware/auth.js';
import { uploadQA } from '../middleware/upload.js';

const router = Router();

// All QA routes require authentication
router.use(authenticate);

// ==================== QA DASHBOARD ====================

/**
 * @swagger
 * /api/qa/dashboard:
 *   get:
 *     tags: [QA Dashboard]
 *     summary: Get QA dashboard overview
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
 *         description: Dashboard data
 */
router.get('/dashboard', qaDashboardController.getDashboard.bind(qaDashboardController));

/**
 * @swagger
 * /api/qa/dashboard/projects:
 *   get:
 *     tags: [QA Dashboard]
 *     summary: Get project-wise QA stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project statistics
 */
router.get('/dashboard/projects', qaDashboardController.getProjectStats.bind(qaDashboardController));

/**
 * @swagger
 * /api/qa/dashboard/activity:
 *   get:
 *     tags: [QA Dashboard]
 *     summary: Get recent QA activity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent activities
 */
router.get('/dashboard/activity', qaDashboardController.getRecentActivity.bind(qaDashboardController));

/**
 * @swagger
 * /api/qa/dashboard/milestone/{milestoneId}:
 *   get:
 *     tags: [QA Dashboard]
 *     summary: Get milestone QA stats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone statistics
 */
router.get('/dashboard/milestone/:milestoneId', qaDashboardController.getMilestoneStats.bind(qaDashboardController));

/**
 * @swagger
 * /api/qa/dashboard/automation:
 *   get:
 *     tags: [QA Dashboard]
 *     summary: Get automation stats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Automation statistics
 */
router.get('/dashboard/automation', qaDashboardController.getAutomationStats.bind(qaDashboardController));

// ==================== TEST CASES ====================

/**
 * @swagger
 * /api/qa/test-cases:
 *   get:
 *     tags: [Test Cases]
 *     summary: Get all test cases
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
 *         name: taskId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, DEPRECATED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MANUAL, AUTOMATION]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of test cases
 */
router.get('/test-cases', testCaseController.findAll.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases/stats:
 *   get:
 *     tags: [Test Cases]
 *     summary: Get test case statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test case statistics
 */
router.get('/test-cases/stats', testCaseController.getStats.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases/task/{taskId}:
 *   get:
 *     tags: [Test Cases]
 *     summary: Get test cases by task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test cases for the task
 */
router.get('/test-cases/task/:taskId', testCaseController.getByTask.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases/project/{projectId}:
 *   get:
 *     tags: [Test Cases]
 *     summary: Get test cases by project
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
 *         description: Test cases for the project
 */
router.get('/test-cases/project/:projectId', testCaseController.getByProject.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases/{id}:
 *   get:
 *     tags: [Test Cases]
 *     summary: Get test case by ID
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
 *         description: Test case details
 */
router.get('/test-cases/:id', testCaseController.findById.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases:
 *   post:
 *     tags: [Test Cases]
 *     summary: Create a new test case
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, steps, expectedResult, taskId, projectId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: string
 *                     expected:
 *                       type: string
 *               expectedResult:
 *                 type: string
 *               preconditions:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *               type:
 *                 type: string
 *                 enum: [MANUAL, AUTOMATION]
 *               taskId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               milestoneId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test case created
 */
router.post('/test-cases', isQC, testCaseController.create.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases/{id}:
 *   patch:
 *     tags: [Test Cases]
 *     summary: Update test case
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
 *         description: Test case updated
 */
router.patch('/test-cases/:id', isQC, testCaseController.update.bind(testCaseController));

/**
 * @swagger
 * /api/qa/test-cases/{id}:
 *   delete:
 *     tags: [Test Cases]
 *     summary: Delete test case (Admin/QC Lead only)
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
 *         description: Test case deleted
 */
router.delete('/test-cases/:id', isAdmin, testCaseController.delete.bind(testCaseController));

// ==================== TEST EXECUTIONS ====================

/**
 * @swagger
 * /api/qa/executions:
 *   get:
 *     tags: [Test Executions]
 *     summary: Get all test executions
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
 *         name: testCaseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOT_RUN, PASS, FAIL, BLOCKED, SKIPPED]
 *     responses:
 *       200:
 *         description: List of executions
 */
router.get('/executions', testExecutionController.findAll.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions/stats:
 *   get:
 *     tags: [Test Executions]
 *     summary: Get execution statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: milestoneId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution statistics
 */
router.get('/executions/stats', testExecutionController.getStats.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions/trend:
 *   get:
 *     tags: [Test Executions]
 *     summary: Get execution trend
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Execution trend data
 */
router.get('/executions/trend', testExecutionController.getTrend.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions/history/{testCaseId}:
 *   get:
 *     tags: [Test Executions]
 *     summary: Get execution history for a test case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testCaseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution history
 */
router.get('/executions/history/:testCaseId', testExecutionController.getHistory.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions/{id}:
 *   get:
 *     tags: [Test Executions]
 *     summary: Get execution by ID
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
 *         description: Execution details
 */
router.get('/executions/:id', testExecutionController.findById.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions:
 *   post:
 *     tags: [Test Executions]
 *     summary: Execute a test case
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [testCaseId, status]
 *             properties:
 *               testCaseId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [NOT_RUN, PASS, FAIL, BLOCKED, SKIPPED]
 *               notes:
 *                 type: string
 *               executionTime:
 *                 type: integer
 *               stepResults:
 *                 type: array
 *     responses:
 *       201:
 *         description: Execution recorded
 */
router.post('/executions', isQC, testExecutionController.execute.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions/bulk:
 *   post:
 *     tags: [Test Executions]
 *     summary: Bulk execute multiple test cases
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [testCaseIds, status]
 *             properties:
 *               testCaseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [NOT_RUN, PASS, FAIL, BLOCKED, SKIPPED]
 *               milestoneId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bulk execution completed
 */
router.post('/executions/bulk', isQC, testExecutionController.bulkExecute.bind(testExecutionController));

/**
 * @swagger
 * /api/qa/executions/{id}:
 *   patch:
 *     tags: [Test Executions]
 *     summary: Update execution
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
 *         description: Execution updated
 */
router.patch('/executions/:id', isQC, testExecutionController.update.bind(testExecutionController));

// ==================== BUGS ====================

/**
 * @swagger
 * /api/qa/bugs:
 *   get:
 *     tags: [Bugs]
 *     summary: Get all bugs
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, FIXED, RETEST, CLOSED, REOPENED]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *       - in: query
 *         name: assignedToId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bugs
 */
router.get('/bugs', bugController.findAll.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/stats:
 *   get:
 *     tags: [Bugs]
 *     summary: Get bug statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bug statistics
 */
router.get('/bugs/stats', bugController.getStats.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/trend:
 *   get:
 *     tags: [Bugs]
 *     summary: Get bug trend
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Bug trend data
 */
router.get('/bugs/trend', bugController.getTrend.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/project/{projectId}:
 *   get:
 *     tags: [Bugs]
 *     summary: Get bugs by project
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
 *         description: Bugs for the project
 */
router.get('/bugs/project/:projectId', bugController.getByProject.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/test-case/{testCaseId}:
 *   get:
 *     tags: [Bugs]
 *     summary: Get bugs by test case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testCaseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bugs for the test case
 */
router.get('/bugs/test-case/:testCaseId', bugController.getByTestCase.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/{id}:
 *   get:
 *     tags: [Bugs]
 *     summary: Get bug by ID
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
 *         description: Bug details
 */
router.get('/bugs/:id', bugController.findById.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs:
 *   post:
 *     tags: [Bugs]
 *     summary: Create a new bug
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, taskId, projectId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *               stepsToReproduce:
 *                 type: string
 *               environment:
 *                 type: string
 *               actualResult:
 *                 type: string
 *               expectedResult:
 *                 type: string
 *               testCaseId:
 *                 type: string
 *               taskId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               assignedToId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bug created
 */
router.post('/bugs', isQC, bugController.create.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/{id}:
 *   patch:
 *     tags: [Bugs]
 *     summary: Update bug
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
 *         description: Bug updated
 */
router.patch('/bugs/:id', isQC, bugController.update.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/{id}/status:
 *   post:
 *     tags: [Bugs]
 *     summary: Update bug status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, FIXED, RETEST, CLOSED, REOPENED]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bug status updated
 */
router.post('/bugs/:id/status', isQC, bugController.updateStatus.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/{id}/assign:
 *   post:
 *     tags: [Bugs]
 *     summary: Assign bug to user
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
 *             required: [assignedToId]
 *             properties:
 *               assignedToId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bug assigned
 */
router.post('/bugs/:id/assign', isQC, bugController.assign.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/{id}/comments:
 *   post:
 *     tags: [Bugs]
 *     summary: Add comment to bug
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
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/bugs/:id/comments', bugController.addComment.bind(bugController));

/**
 * @swagger
 * /api/qa/bugs/{id}:
 *   delete:
 *     tags: [Bugs]
 *     summary: Delete bug (Admin only)
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
 *         description: Bug deleted
 */
router.delete('/bugs/:id', isAdmin, bugController.delete.bind(bugController));

// ==================== ATTACHMENTS ====================

/**
 * @swagger
 * /api/qa/attachments/upload:
 *   post:
 *     tags: [QA Attachments]
 *     summary: Upload attachment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               testCaseId:
 *                 type: string
 *               testExecutionId:
 *                 type: string
 *               bugId:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded
 */
router.post('/attachments/upload', isQC, uploadQA.single('file'), qaAttachmentController.upload.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/upload-multiple:
 *   post:
 *     tags: [QA Attachments]
 *     summary: Upload multiple attachments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               testCaseId:
 *                 type: string
 *               testExecutionId:
 *                 type: string
 *               bugId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Files uploaded
 */
router.post('/attachments/upload-multiple', isQC, uploadQA.array('files', 5), qaAttachmentController.uploadMultiple.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/test-case/{testCaseId}:
 *   get:
 *     tags: [QA Attachments]
 *     summary: Get attachments by test case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testCaseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachments list
 */
router.get('/attachments/test-case/:testCaseId', qaAttachmentController.getByTestCase.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/execution/{executionId}:
 *   get:
 *     tags: [QA Attachments]
 *     summary: Get attachments by execution
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachments list
 */
router.get('/attachments/execution/:executionId', qaAttachmentController.getByExecution.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/bug/{bugId}:
 *   get:
 *     tags: [QA Attachments]
 *     summary: Get attachments by bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bugId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachments list
 */
router.get('/attachments/bug/:bugId', qaAttachmentController.getByBug.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/{id}:
 *   get:
 *     tags: [QA Attachments]
 *     summary: Get attachment metadata
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
 *         description: Attachment metadata
 */
router.get('/attachments/:id', qaAttachmentController.findById.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/{id}/serve:
 *   get:
 *     tags: [QA Attachments]
 *     summary: Serve attachment file (inline)
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
 *         description: File content
 */
router.get('/attachments/:id/serve', qaAttachmentController.serve.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/{id}/download:
 *   get:
 *     tags: [QA Attachments]
 *     summary: Download attachment file
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
 *         description: File download
 */
router.get('/attachments/:id/download', qaAttachmentController.download.bind(qaAttachmentController));

/**
 * @swagger
 * /api/qa/attachments/{id}:
 *   delete:
 *     tags: [QA Attachments]
 *     summary: Delete attachment
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
 *         description: Attachment deleted
 */
router.delete('/attachments/:id', isQC, qaAttachmentController.delete.bind(qaAttachmentController));

export default router;
