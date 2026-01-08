import { Request, Response } from 'express';
import { jobPostService } from '../services/jobpost.service.js';
import { JobPostStatus, WorkLocation, ApplicationStage, InterviewType, TechStack } from '@prisma/client';

export class JobPostController {
  // ==================== JOB POSTS ====================

  async createJobPost(req: Request, res: Response) {
    try {
      const jobPost = await jobPostService.createJobPost(req.body);
      res.status(201).json({ success: true, data: jobPost });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getJobPosts(req: Request, res: Response) {
    try {
      const { status, department, search, techStack, location } = req.query;

      const filters: any = {};
      if (status) filters.status = status as JobPostStatus;
      if (department) filters.department = department as string;
      if (search) filters.search = search as string;
      if (techStack) {
        filters.techStack = (techStack as string).split(',') as TechStack[];
      }
      if (location) filters.location = location as WorkLocation;

      const jobPosts = await jobPostService.getJobPosts(filters);
      res.json({ success: true, data: jobPosts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getJobPostById(req: Request, res: Response) {
    try {
      const jobPost = await jobPostService.getJobPostById(req.params.id);
      if (!jobPost) {
        return res.status(404).json({ success: false, message: 'Job post not found' });
      }
      res.json({ success: true, data: jobPost });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateJobPost(req: Request, res: Response) {
    try {
      const jobPost = await jobPostService.updateJobPost(req.params.id, req.body);
      res.json({ success: true, data: jobPost });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteJobPost(req: Request, res: Response) {
    try {
      await jobPostService.deleteJobPost(req.params.id);
      res.json({ success: true, message: 'Job post deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publishJobPost(req: Request, res: Response) {
    try {
      const jobPost = await jobPostService.publishJobPost(req.params.id);
      res.json({ success: true, data: jobPost });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async closeJobPost(req: Request, res: Response) {
    try {
      const jobPost = await jobPostService.closeJobPost(req.params.id);
      res.json({ success: true, data: jobPost });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getJobPostStats(req: Request, res: Response) {
    try {
      const stats = await jobPostService.getJobPostStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== APPLICATIONS ====================

  async createApplication(req: Request, res: Response) {
    try {
      const application = await jobPostService.createApplication(req.body);
      res.status(201).json({ success: true, data: application });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getApplications(req: Request, res: Response) {
    try {
      const { jobPostId, candidateId } = req.query;
      const applications = await jobPostService.getApplications(
        jobPostId as string,
        candidateId as string
      );
      res.json({ success: true, data: applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getApplicationById(req: Request, res: Response) {
    try {
      const application = await jobPostService.getApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      res.json({ success: true, data: application });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateApplication(req: Request, res: Response) {
    try {
      const application = await jobPostService.updateApplication(req.params.id, req.body);
      res.json({ success: true, data: application });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async moveApplicationStage(req: Request, res: Response) {
    try {
      const { stage, notes } = req.body;
      const application = await jobPostService.moveApplicationStage(
        req.params.id,
        stage as ApplicationStage,
        notes
      );
      res.json({ success: true, data: application });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async shortlistApplication(req: Request, res: Response) {
    try {
      const { shortlist } = req.body;
      const application = await jobPostService.shortlistApplication(req.params.id, shortlist);
      res.json({ success: true, data: application });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectApplication(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      const application = await jobPostService.rejectApplication(req.params.id, reason);
      res.json({ success: true, data: application });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteApplication(req: Request, res: Response) {
    try {
      await jobPostService.deleteApplication(req.params.id);
      res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getApplicationStats(req: Request, res: Response) {
    try {
      const { jobPostId } = req.query;
      const stats = await jobPostService.getApplicationStats(jobPostId as string);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRecruitmentPipeline(req: Request, res: Response) {
    try {
      const { jobPostId } = req.query;
      const pipeline = await jobPostService.getRecruitmentPipeline(jobPostId as string);
      res.json({ success: true, data: pipeline });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== INTERVIEWS ====================

  async scheduleInterview(req: Request, res: Response) {
    try {
      const interview = await jobPostService.scheduleInterview(req.body);
      res.status(201).json({ success: true, data: interview });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateInterview(req: Request, res: Response) {
    try {
      const interview = await jobPostService.updateInterview(req.params.id, req.body);
      res.json({ success: true, data: interview });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async completeInterview(req: Request, res: Response) {
    try {
      const { feedback, rating, recommendation } = req.body;
      const interview = await jobPostService.completeInterview(
        req.params.id,
        feedback,
        rating,
        recommendation
      );
      res.json({ success: true, data: interview });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async cancelInterview(req: Request, res: Response) {
    try {
      const interview = await jobPostService.cancelInterview(req.params.id);
      res.json({ success: true, data: interview });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteInterview(req: Request, res: Response) {
    try {
      await jobPostService.deleteInterview(req.params.id);
      res.json({ success: true, message: 'Interview deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== CANDIDATE SEARCH ====================

  async searchCandidatesForJob(req: Request, res: Response) {
    try {
      const candidates = await jobPostService.searchCandidatesForJob(req.params.jobPostId);
      res.json({ success: true, data: candidates });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== ENUMS ====================

  async getEnums(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          jobStatuses: jobPostService.getAllJobStatuses(),
          workLocations: jobPostService.getAllWorkLocations(),
          applicationStages: jobPostService.getAllApplicationStages(),
          interviewTypes: jobPostService.getAllInterviewTypes(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const jobPostController = new JobPostController();
