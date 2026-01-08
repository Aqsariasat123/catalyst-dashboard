import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import timeEntryRoutes from './timeEntry.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import accountsRoutes from './accounts.routes.js';
import milestoneRoutes from './milestone.routes.js';
import transactionRoutes from './transaction.routes.js';
import hrRoutes from './hr.routes.js';
import recruitmentRoutes from './recruitment.routes.js';
import jobPostRoutes from './jobpost.routes.js';
import aiAssistantRoutes from './ai-assistant.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/time-entries', timeEntryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/accounts', accountsRoutes);
router.use('/transactions', transactionRoutes);
router.use('/hr', hrRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/job-posts', jobPostRoutes);
router.use('/ai-assistant', aiAssistantRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', milestoneRoutes);

export default router;
