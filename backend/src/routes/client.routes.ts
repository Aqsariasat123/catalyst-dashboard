import { Router } from 'express';
import { clientController } from '../controllers/client.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags: [Clients]
 *     summary: Get all clients
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
 *         name: clientType
 *         schema:
 *           type: string
 *           enum: [UPWORK, DIRECT]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/', isAdmin, clientController.findAll.bind(clientController));

/**
 * @swagger
 * /api/clients/all:
 *   get:
 *     tags: [Clients]
 *     summary: Get all clients (dropdown list)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all clients
 */
router.get('/all', isAdmin, clientController.getAll.bind(clientController));

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Get client by ID
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
 *         description: Client details
 */
router.get('/:id', isAdmin, clientController.findById.bind(clientController));

/**
 * @swagger
 * /api/clients:
 *   post:
 *     tags: [Clients]
 *     summary: Create new client
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, clientType]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               clientType:
 *                 type: string
 *                 enum: [UPWORK, DIRECT]
 *     responses:
 *       201:
 *         description: Client created
 */
router.post('/', isAdmin, clientController.create.bind(clientController));

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     tags: [Clients]
 *     summary: Update client
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
 *         description: Client updated
 */
router.patch('/:id', isAdmin, clientController.update.bind(clientController));

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     tags: [Clients]
 *     summary: Delete client
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
 *         description: Client deleted
 */
router.delete('/:id', isAdmin, clientController.delete.bind(clientController));

export default router;
