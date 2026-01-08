import { prisma } from '../config/database.js';
import { TechStack, JobPostStatus, WorkLocation, ApplicationStage, InterviewType } from '@prisma/client';

// ==================== DTOs ====================

export interface CreateJobPostDTO {
  title: string;
  department?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  positions?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: WorkLocation;
  techStack?: TechStack[];
  experienceMin?: number;
  experienceMax?: number;
  deadline?: Date;
  notes?: string;
  isUrgent?: boolean;
}

export interface UpdateJobPostDTO extends Partial<CreateJobPostDTO> {
  status?: JobPostStatus;
}

export interface JobPostFilters {
  status?: JobPostStatus;
  department?: string;
  search?: string;
  techStack?: TechStack[];
  location?: WorkLocation;
}

export interface CreateApplicationDTO {
  candidateId: string;
  jobPostId: string;
  expectedSalary?: number;
  availableFrom?: Date;
  coverLetter?: string;
}

export interface UpdateApplicationDTO {
  stage?: ApplicationStage;
  stageNotes?: string;
  rating?: number;
  isShortlisted?: boolean;
  rejectionReason?: string;
}

export interface CreateInterviewDTO {
  applicationId: string;
  type: InterviewType;
  scheduledAt?: Date;
  interviewerName?: string;
  interviewerId?: string;
  location?: string;
  duration?: number;
}

export interface UpdateInterviewDTO {
  scheduledAt?: Date;
  completedAt?: Date;
  interviewerName?: string;
  location?: string;
  duration?: number;
  feedback?: string;
  rating?: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: string;
  status?: string;
}

// ==================== SERVICE ====================

export class JobPostService {
  // ==================== JOB POSTS ====================

  async createJobPost(data: CreateJobPostDTO) {
    return prisma.jobPost.create({
      data: {
        title: data.title,
        department: data.department,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        positions: data.positions || 1,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        currency: data.currency || 'PKR',
        location: data.location || 'ONSITE',
        techStack: data.techStack || [],
        experienceMin: data.experienceMin,
        experienceMax: data.experienceMax,
        deadline: data.deadline,
        notes: data.notes,
        isUrgent: data.isUrgent || false,
      },
      include: {
        _count: { select: { applications: true } },
      },
    });
  }

  async getJobPosts(filters?: JobPostFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.department) {
      where.department = { contains: filters.department, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { department: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.techStack && filters.techStack.length > 0) {
      where.techStack = { hasSome: filters.techStack };
    }

    if (filters?.location) {
      where.location = filters.location;
    }

    return prisma.jobPost.findMany({
      where,
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: {
            stage: true,
          },
        },
      },
      orderBy: [{ isUrgent: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getJobPostById(id: string) {
    return prisma.jobPost.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            candidate: true,
            interviews: {
              orderBy: { roundNumber: 'asc' },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
        _count: { select: { applications: true } },
      },
    });
  }

  async updateJobPost(id: string, data: UpdateJobPostDTO) {
    const updateData: any = { ...data };

    // If status is changing to OPEN and postedAt is not set, set it
    if (data.status === 'OPEN') {
      const existing = await prisma.jobPost.findUnique({ where: { id } });
      if (!existing?.postedAt) {
        updateData.postedAt = new Date();
      }
    }

    // If status is changing to CLOSED, set closedAt
    if (data.status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    return prisma.jobPost.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { applications: true } },
      },
    });
  }

  async deleteJobPost(id: string) {
    return prisma.jobPost.delete({ where: { id } });
  }

  async publishJobPost(id: string) {
    return prisma.jobPost.update({
      where: { id },
      data: {
        status: 'OPEN',
        postedAt: new Date(),
      },
    });
  }

  async closeJobPost(id: string) {
    return prisma.jobPost.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  // ==================== APPLICATIONS ====================

  async createApplication(data: CreateApplicationDTO) {
    // Check if application already exists
    const existing = await prisma.candidateApplication.findUnique({
      where: {
        candidateId_jobPostId: {
          candidateId: data.candidateId,
          jobPostId: data.jobPostId,
        },
      },
    });

    if (existing) {
      throw new Error('Candidate has already applied to this job post');
    }

    return prisma.candidateApplication.create({
      data: {
        candidateId: data.candidateId,
        jobPostId: data.jobPostId,
        expectedSalary: data.expectedSalary,
        availableFrom: data.availableFrom,
        coverLetter: data.coverLetter,
      },
      include: {
        candidate: true,
        jobPost: true,
      },
    });
  }

  async getApplications(jobPostId?: string, candidateId?: string) {
    const where: any = {};

    if (jobPostId) {
      where.jobPostId = jobPostId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    return prisma.candidateApplication.findMany({
      where,
      include: {
        candidate: true,
        jobPost: true,
        interviews: {
          orderBy: { roundNumber: 'asc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getApplicationById(id: string) {
    return prisma.candidateApplication.findUnique({
      where: { id },
      include: {
        candidate: true,
        jobPost: true,
        interviews: {
          orderBy: { roundNumber: 'asc' },
        },
      },
    });
  }

  async updateApplication(id: string, data: UpdateApplicationDTO) {
    const updateData: any = { ...data };

    if (data.stage) {
      updateData.stageUpdatedAt = new Date();
    }

    return prisma.candidateApplication.update({
      where: { id },
      data: updateData,
      include: {
        candidate: true,
        jobPost: true,
        interviews: true,
      },
    });
  }

  async moveApplicationStage(id: string, stage: ApplicationStage, notes?: string) {
    return prisma.candidateApplication.update({
      where: { id },
      data: {
        stage,
        stageUpdatedAt: new Date(),
        stageNotes: notes,
      },
      include: {
        candidate: true,
        jobPost: true,
      },
    });
  }

  async shortlistApplication(id: string, shortlist: boolean) {
    return prisma.candidateApplication.update({
      where: { id },
      data: { isShortlisted: shortlist },
    });
  }

  async rejectApplication(id: string, reason?: string) {
    return prisma.candidateApplication.update({
      where: { id },
      data: {
        stage: 'REJECTED',
        stageUpdatedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async deleteApplication(id: string) {
    return prisma.candidateApplication.delete({ where: { id } });
  }

  // ==================== INTERVIEWS ====================

  async scheduleInterview(data: CreateInterviewDTO) {
    // Get the next round number
    const lastInterview = await prisma.interviewRound.findFirst({
      where: { applicationId: data.applicationId },
      orderBy: { roundNumber: 'desc' },
    });

    const roundNumber = (lastInterview?.roundNumber || 0) + 1;

    return prisma.interviewRound.create({
      data: {
        applicationId: data.applicationId,
        roundNumber,
        type: data.type,
        scheduledAt: data.scheduledAt,
        interviewerName: data.interviewerName,
        interviewerId: data.interviewerId,
        location: data.location,
        duration: data.duration,
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPost: true,
          },
        },
      },
    });
  }

  async updateInterview(id: string, data: UpdateInterviewDTO) {
    return prisma.interviewRound.update({
      where: { id },
      data,
      include: {
        application: {
          include: {
            candidate: true,
            jobPost: true,
          },
        },
      },
    });
  }

  async completeInterview(id: string, feedback: string, rating: number, recommendation: string) {
    return prisma.interviewRound.update({
      where: { id },
      data: {
        completedAt: new Date(),
        feedback,
        rating,
        recommendation,
        status: 'COMPLETED',
      },
    });
  }

  async cancelInterview(id: string) {
    return prisma.interviewRound.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async deleteInterview(id: string) {
    return prisma.interviewRound.delete({ where: { id } });
  }

  // ==================== STATS & ANALYTICS ====================

  async getJobPostStats() {
    const [total, byStatus, openPositions] = await Promise.all([
      prisma.jobPost.count(),
      prisma.jobPost.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.jobPost.aggregate({
        where: { status: 'OPEN' },
        _sum: { positions: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      openPositions: openPositions._sum.positions || 0,
    };
  }

  async getApplicationStats(jobPostId?: string) {
    const where = jobPostId ? { jobPostId } : {};

    const [total, byStage] = await Promise.all([
      prisma.candidateApplication.count({ where }),
      prisma.candidateApplication.groupBy({
        by: ['stage'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStage: byStage.reduce((acc, s) => ({ ...acc, [s.stage]: s._count }), {}),
    };
  }

  async getRecruitmentPipeline(jobPostId?: string) {
    const where = jobPostId ? { jobPostId } : {};

    const applications = await prisma.candidateApplication.findMany({
      where,
      include: {
        candidate: true,
        jobPost: { select: { title: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Group by stage
    const pipeline: Record<string, typeof applications> = {};
    applications.forEach((app) => {
      if (!pipeline[app.stage]) {
        pipeline[app.stage] = [];
      }
      pipeline[app.stage].push(app);
    });

    return pipeline;
  }

  // ==================== CANDIDATE SEARCH ====================

  async searchCandidatesForJob(jobPostId: string) {
    // Get job post requirements
    const jobPost = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (!jobPost) throw new Error('Job post not found');

    // Find candidates that match the tech stack and haven't applied yet
    const appliedCandidateIds = await prisma.candidateApplication.findMany({
      where: { jobPostId },
      select: { candidateId: true },
    });

    const excludeIds = appliedCandidateIds.map((a) => a.candidateId);

    const where: any = {
      id: { notIn: excludeIds },
    };

    if (jobPost.techStack.length > 0) {
      where.techStack = { hasSome: jobPost.techStack };
    }

    if (jobPost.experienceMin) {
      where.experience = { gte: jobPost.experienceMin };
    }

    return prisma.candidate.findMany({
      where,
      orderBy: { rating: 'desc' },
    });
  }

  // Get enums for frontend
  getAllJobStatuses(): JobPostStatus[] {
    return Object.values(JobPostStatus);
  }

  getAllWorkLocations(): WorkLocation[] {
    return Object.values(WorkLocation);
  }

  getAllApplicationStages(): ApplicationStage[] {
    return Object.values(ApplicationStage);
  }

  getAllInterviewTypes(): InterviewType[] {
    return Object.values(InterviewType);
  }
}

export const jobPostService = new JobPostService();
