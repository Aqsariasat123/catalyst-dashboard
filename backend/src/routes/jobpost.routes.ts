import { Router } from 'express';
import { jobPostController } from '../controllers/jobpost.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== ENUMS ====================
router.get('/enums', jobPostController.getEnums.bind(jobPostController));

// ==================== JOB POSTS ====================
router.post('/', jobPostController.createJobPost.bind(jobPostController));
router.get('/', jobPostController.getJobPosts.bind(jobPostController));
router.get('/stats', jobPostController.getJobPostStats.bind(jobPostController));
router.get('/:id', jobPostController.getJobPostById.bind(jobPostController));
router.patch('/:id', jobPostController.updateJobPost.bind(jobPostController));
router.delete('/:id', jobPostController.deleteJobPost.bind(jobPostController));
router.post('/:id/publish', jobPostController.publishJobPost.bind(jobPostController));
router.post('/:id/close', jobPostController.closeJobPost.bind(jobPostController));
router.get('/:jobPostId/candidates/search', jobPostController.searchCandidatesForJob.bind(jobPostController));

// ==================== APPLICATIONS ====================
router.post('/applications', jobPostController.createApplication.bind(jobPostController));
router.get('/applications', jobPostController.getApplications.bind(jobPostController));
router.get('/applications/stats', jobPostController.getApplicationStats.bind(jobPostController));
router.get('/applications/pipeline', jobPostController.getRecruitmentPipeline.bind(jobPostController));
router.get('/applications/:id', jobPostController.getApplicationById.bind(jobPostController));
router.patch('/applications/:id', jobPostController.updateApplication.bind(jobPostController));
router.post('/applications/:id/stage', jobPostController.moveApplicationStage.bind(jobPostController));
router.post('/applications/:id/shortlist', jobPostController.shortlistApplication.bind(jobPostController));
router.post('/applications/:id/reject', jobPostController.rejectApplication.bind(jobPostController));
router.delete('/applications/:id', jobPostController.deleteApplication.bind(jobPostController));

// ==================== INTERVIEWS ====================
router.post('/interviews', jobPostController.scheduleInterview.bind(jobPostController));
router.patch('/interviews/:id', jobPostController.updateInterview.bind(jobPostController));
router.post('/interviews/:id/complete', jobPostController.completeInterview.bind(jobPostController));
router.post('/interviews/:id/cancel', jobPostController.cancelInterview.bind(jobPostController));
router.delete('/interviews/:id', jobPostController.deleteInterview.bind(jobPostController));

export default router;
