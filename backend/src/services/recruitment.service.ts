import { prisma } from '../config/database.js';
import { TechStack, CandidateStatus } from '@prisma/client';

export interface CreateCandidateDTO {
  name: string;
  email?: string;
  phone?: string;
  techStack?: TechStack[];
  experience?: number;
  currentCtc?: number;
  expectedCtc?: number;
  noticePeriod?: number;
  cvUrl?: string;
  cvFileName?: string;
  cvFilePath?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  source?: string;
  notes?: string;
  appliedFor?: string;
}

export interface CandidateFilters {
  techStack?: TechStack[];
  status?: CandidateStatus;
  search?: string;
  minExperience?: number;
  maxExperience?: number;
}

export class RecruitmentService {
  async createCandidate(data: CreateCandidateDTO) {
    return prisma.candidate.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        techStack: data.techStack || [],
        experience: data.experience,
        currentCtc: data.currentCtc,
        expectedCtc: data.expectedCtc,
        noticePeriod: data.noticePeriod,
        cvUrl: data.cvUrl,
        portfolioUrl: data.portfolioUrl,
        linkedInUrl: data.linkedInUrl,
        source: data.source,
        notes: data.notes,
        appliedFor: data.appliedFor,
      },
    });
  }

  async getCandidates(filters?: CandidateFilters) {
    const where: any = {};

    if (filters?.techStack && filters.techStack.length > 0) {
      where.techStack = { hasSome: filters.techStack };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { appliedFor: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.minExperience !== undefined) {
      where.experience = { ...where.experience, gte: filters.minExperience };
    }

    if (filters?.maxExperience !== undefined) {
      where.experience = { ...where.experience, lte: filters.maxExperience };
    }

    return prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCandidateById(id: string) {
    return prisma.candidate.findUnique({ where: { id } });
  }

  async updateCandidate(id: string, data: Partial<CreateCandidateDTO & { status: CandidateStatus; rating: number; interviewDate: Date }>) {
    return prisma.candidate.update({
      where: { id },
      data,
    });
  }

  async updateCandidateStatus(id: string, status: CandidateStatus) {
    return prisma.candidate.update({
      where: { id },
      data: { status },
    });
  }

  async deleteCandidate(id: string) {
    return prisma.candidate.delete({ where: { id } });
  }

  async getCandidatesByTechStack(techStack: TechStack) {
    return prisma.candidate.findMany({
      where: { techStack: { has: techStack } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const [total, byStatus, byTechStack] = await Promise.all([
      prisma.candidate.count(),
      prisma.candidate.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.candidate.findMany({
        select: { techStack: true },
      }),
    ]);

    // Calculate tech stack distribution
    const techStackCount: Record<string, number> = {};
    byTechStack.forEach((c) => {
      c.techStack.forEach((ts) => {
        techStackCount[ts] = (techStackCount[ts] || 0) + 1;
      });
    });

    return {
      total,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      byTechStack: techStackCount,
    };
  }

  async scheduleInterview(id: string, interviewDate: Date) {
    return prisma.candidate.update({
      where: { id },
      data: {
        interviewDate,
        status: 'INTERVIEW',
      },
    });
  }

  async rateCandidate(id: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return prisma.candidate.update({
      where: { id },
      data: { rating },
    });
  }

  // Get all available tech stacks for filtering
  getAllTechStacks(): TechStack[] {
    return Object.values(TechStack);
  }

  // Get all candidate statuses for filtering
  getAllStatuses(): CandidateStatus[] {
    return Object.values(CandidateStatus);
  }
}

export const recruitmentService = new RecruitmentService();
