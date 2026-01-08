import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions
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
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectName
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/', transactionController.findAll.bind(transactionController));

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction summary/statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction summary
 */
router.get('/summary', transactionController.getSummary.bind(transactionController));

/**
 * @swagger
 * /api/transactions/projects:
 *   get:
 *     tags: [Transactions]
 *     summary: Get unique projects from transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects extracted from transactions
 */
router.get('/projects', transactionController.getProjects.bind(transactionController));

/**
 * @swagger
 * /api/transactions/import:
 *   post:
 *     tags: [Transactions]
 *     summary: Import transactions from CSV (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [csvContent]
 *             properties:
 *               csvContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transactions imported
 */
router.post('/import', isAdmin, transactionController.importCSV.bind(transactionController));

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, type, amount, currency]
 *             properties:
 *               date:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction created
 */
router.post('/', isAdmin, transactionController.create.bind(transactionController));

/**
 * @swagger
 * /api/transactions/create-project:
 *   post:
 *     tags: [Transactions]
 *     summary: Create project from transaction data (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName]
 *             properties:
 *               projectName:
 *                 type: string
 *               clientName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project created
 */
router.post('/create-project', isAdmin, transactionController.createProjectFromTransaction.bind(transactionController));

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by ID
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
 *         description: Transaction details
 */
router.get('/:id', transactionController.findById.bind(transactionController));

/**
 * @swagger
 * /api/transactions/{id}:
 *   patch:
 *     tags: [Transactions]
 *     summary: Update transaction (Admin only)
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
 *         description: Transaction updated
 */
router.patch('/:id', isAdmin, transactionController.update.bind(transactionController));

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete transaction (Admin only)
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
 *         description: Transaction deleted
 */
router.delete('/:id', isAdmin, transactionController.delete.bind(transactionController));

export default router;
