import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import timeEntryRoutes from './timeEntry.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import accountsRoutes from './accounts.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/time-entries', timeEntryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/accounts', accountsRoutes);

export default router;
