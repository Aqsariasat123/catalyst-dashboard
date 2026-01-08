import { Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../types/index.js';
import { sendSuccess } from '../utils/helpers.js';
import { recruitmentService } from '../services/recruitment.service.js';

const techStackValues = [
  'REACT', 'ANGULAR', 'VUE', 'NEXTJS', 'NODE', 'EXPRESS', 'NESTJS', 'PYTHON', 'DJANGO', 'FASTAPI',
  'JAVA', 'SPRING', 'DOTNET', 'PHP', 'LARAVEL', 'RUBY', 'RAILS', 'GO', 'RUST', 'FLUTTER',
  'REACT_NATIVE', 'ANDROID', 'IOS', 'SWIFT', 'KOTLIN', 'DEVOPS', 'AWS', 'AZURE', 'GCP', 'DOCKER',
  'KUBERNETES', 'QA', 'AUTOMATION', 'MANUAL_TESTING', 'UI_UX', 'GRAPHIC_DESIGN', 'FIGMA',
  'PHOTOSHOP', 'AI_ML', 'DATA_SCIENCE', 'BLOCKCHAIN', 'OTHER'
] as const;

const candidateStatusValues = [
  'NEW', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'HR_ROUND', 'OFFERED', 'HIRED', 'REJECTED', 'ON_HOLD'
] as const;

const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  techStack: z.array(z.enum(techStackValues)).optional(),
  experience: z.number().min(0).optional().nullable(),
  currentCtc: z.number().min(0).optional().nullable(),
  expectedCtc: z.number().min(0).optional().nullable(),
  noticePeriod: z.number().min(0).optional().nullable(),
  cvUrl: z.string().optional().nullable(),
  portfolioUrl: z.string().optional().nullable(),
  linkedInUrl: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  appliedFor: z.string().optional().nullable(),
});

const updateCandidateSchema = createCandidateSchema.partial().extend({
  status: z.enum(candidateStatusValues).optional(),
  rating: z.number().min(1).max(5).optional().nullable(),
  interviewDate: z.string().optional().nullable(),
});

export class RecruitmentController {
  async createCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCandidateSchema.parse(req.body);
      const result = await recruitmentService.createCandidate(data as any);
      sendSuccess(res, result, 'Candidate added successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCandidates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: any = {};

      if (req.query.techStack) {
        const techStack = Array.isArray(req.query.techStack)
          ? req.query.techStack
          : [req.query.techStack];
        filters.techStack = techStack;
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      if (req.query.search) {
        filters.search = req.query.search;
      }

      if (req.query.minExperience) {
        filters.minExperience = parseInt(req.query.minExperience as string);
      }

      if (req.query.maxExperience) {
        filters.maxExperience = parseInt(req.query.maxExperience as string);
      }

      const result = await recruitmentService.getCandidates(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.getCandidateById(req.params.id);
      if (!result) {
        res.status(404).json({ success: false, message: 'Candidate not found' });
        return;
      }
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCandidateSchema.parse(req.body);
      const updateData: any = { ...data };

      if (data.interviewDate) {
        updateData.interviewDate = new Date(data.interviewDate);
      }

      const result = await recruitmentService.updateCandidate(req.params.id, updateData);
      sendSuccess(res, result, 'Candidate updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCandidateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const result = await recruitmentService.updateCandidateStatus(req.params.id, status);
      sendSuccess(res, result, 'Status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await recruitmentService.deleteCandidate(req.params.id);
      sendSuccess(res, null, 'Candidate deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async scheduleInterview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { interviewDate } = req.body;
      const result = await recruitmentService.scheduleInterview(req.params.id, new Date(interviewDate));
      sendSuccess(res, result, 'Interview scheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  async rateCandidate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rating } = req.body;
      const result = await recruitmentService.rateCandidate(req.params.id, rating);
      sendSuccess(res, result, 'Rating updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recruitmentService.getStats();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getTechStacks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = recruitmentService.getAllTechStacks();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStatuses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = recruitmentService.getAllStatuses();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async uploadCV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidateId = req.params.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      // Update candidate with CV info
      const result = await recruitmentService.updateCandidate(candidateId, {
        cvFileName: file.originalname,
        cvFilePath: file.path,
        cvUrl: `/api/recruitment/candidates/${candidateId}/cv/download`,
      });

      sendSuccess(res, result, 'CV uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async downloadCV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const candidate = await recruitmentService.getCandidateById(req.params.id);

      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate not found' });
        return;
      }

      if (!candidate.cvFilePath) {
        res.status(404).json({ success: false, message: 'No CV uploaded for this candidate' });
        return;
      }

      const filePath = path.resolve(candidate.cvFilePath);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ success: false, message: 'CV file not found' });
        return;
      }

      const fileName = candidate.cvFileName || 'cv.pdf';
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

export const recruitmentController = new RecruitmentController();
