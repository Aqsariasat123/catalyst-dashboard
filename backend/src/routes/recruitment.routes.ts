import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { recruitmentController } from '../controllers/recruitment.controller.js';
import { uploadCV } from '../middleware/upload.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get available tech stacks and statuses for filters
router.get('/tech-stacks', recruitmentController.getTechStacks.bind(recruitmentController));
router.get('/statuses', recruitmentController.getStatuses.bind(recruitmentController));

// Get recruitment stats
router.get('/stats', recruitmentController.getStats.bind(recruitmentController));

// Candidate CRUD
router.post('/candidates', recruitmentController.createCandidate.bind(recruitmentController));
router.get('/candidates', recruitmentController.getCandidates.bind(recruitmentController));
router.get('/candidates/:id', recruitmentController.getCandidateById.bind(recruitmentController));
router.patch('/candidates/:id', recruitmentController.updateCandidate.bind(recruitmentController));
router.delete('/candidates/:id', recruitmentController.deleteCandidate.bind(recruitmentController));

// Candidate actions
router.patch('/candidates/:id/status', recruitmentController.updateCandidateStatus.bind(recruitmentController));
router.post('/candidates/:id/schedule-interview', recruitmentController.scheduleInterview.bind(recruitmentController));
router.post('/candidates/:id/rate', recruitmentController.rateCandidate.bind(recruitmentController));

// CV upload
router.post('/candidates/:id/upload-cv', uploadCV.single('cv'), recruitmentController.uploadCV.bind(recruitmentController));
router.get('/candidates/:id/cv/download', recruitmentController.downloadCV.bind(recruitmentController));

export default router;
