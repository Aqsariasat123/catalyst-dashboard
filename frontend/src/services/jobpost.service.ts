import api from './api';
import { ApiResponse } from '@/types';

// ==================== TYPES ====================

export type JobPostStatus = 'DRAFT' | 'OPEN' | 'ON_HOLD' | 'CLOSED' | 'CANCELLED';
export type WorkLocation = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ApplicationStage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'TECHNICAL' | 'HR_ROUND' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewType = 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL_TEST' | 'HR';
export type TechStack = string;

export interface JobPost {
  id: string;
  title: string;
  department: string | null;
  description: string | null;
  requirements: string | null;
  responsibilities: string | null;
  positions: number;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  location: WorkLocation;
  techStack: TechStack[];
  experienceMin: number | null;
  experienceMax: number | null;
  status: JobPostStatus;
  deadline: string | null;
  postedAt: string | null;
  closedAt: string | null;
  createdById: string | null;
  notes: string | null;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { applications: number };
  applications?: CandidateApplication[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  techStack: TechStack[];
  experience: number | null;
  currentCtc: number | null;
  expectedCtc: number | null;
  noticePeriod: number | null;
  cvUrl: string | null;
  cvFileName: string | null;
  cvFilePath: string | null;
  portfolioUrl: string | null;
  linkedInUrl: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  rating: number | null;
  interviewDate: string | null;
  appliedFor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateApplication {
  id: string;
  candidateId: string;
  jobPostId: string;
  stage: ApplicationStage;
  appliedAt: string;
  stageUpdatedAt: string | null;
  expectedSalary: number | null;
  availableFrom: string | null;
  coverLetter: string | null;
  stageNotes: string | null;
  rating: number | null;
  isShortlisted: boolean;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
  jobPost?: JobPost;
  interviews?: InterviewRound[];
}

export interface InterviewRound {
  id: string;
  applicationId: string;
  roundNumber: number;
  type: InterviewType;
  scheduledAt: string | null;
  completedAt: string | null;
  interviewerName: string | null;
  interviewerId: string | null;
  location: string | null;
  duration: number | null;
  feedback: string | null;
  rating: number | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPostData {
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
  deadline?: string;
  notes?: string;
  isUrgent?: boolean;
}

export interface JobPostFilters {
  status?: JobPostStatus;
  department?: string;
  search?: string;
  techStack?: TechStack[];
  location?: WorkLocation;
}

export interface CreateApplicationData {
  candidateId: string;
  jobPostId: string;
  expectedSalary?: number;
  availableFrom?: string;
  coverLetter?: string;
}

export interface CreateInterviewData {
  applicationId: string;
  type: InterviewType;
  scheduledAt?: string;
  interviewerName?: string;
  interviewerId?: string;
  location?: string;
  duration?: number;
}

// ==================== SERVICE ====================

export const jobPostService = {
  // ==================== JOB POSTS ====================

  async createJobPost(data: CreateJobPostData): Promise<JobPost> {
    const response = await api.post<ApiResponse<JobPost>>('/job-posts', data);
    return response.data.data!;
  },

  async getJobPosts(filters?: JobPostFilters): Promise<JobPost[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.techStack?.length) params.append('techStack', filters.techStack.join(','));
    if (filters?.location) params.append('location', filters.location);

    const response = await api.get<ApiResponse<JobPost[]>>(`/job-posts?${params}`);
    return response.data.data!;
  },

  async getJobPostById(id: string): Promise<JobPost> {
    const response = await api.get<ApiResponse<JobPost>>(`/job-posts/${id}`);
    return response.data.data!;
  },

  async updateJobPost(id: string, data: Partial<CreateJobPostData & { status: JobPostStatus }>): Promise<JobPost> {
    const response = await api.patch<ApiResponse<JobPost>>(`/job-posts/${id}`, data);
    return response.data.data!;
  },

  async deleteJobPost(id: string): Promise<void> {
    await api.delete(`/job-posts/${id}`);
  },

  async publishJobPost(id: string): Promise<JobPost> {
    const response = await api.post<ApiResponse<JobPost>>(`/job-posts/${id}/publish`);
    return response.data.data!;
  },

  async closeJobPost(id: string): Promise<JobPost> {
    const response = await api.post<ApiResponse<JobPost>>(`/job-posts/${id}/close`);
    return response.data.data!;
  },

  async getJobPostStats(): Promise<{ total: number; byStatus: Record<string, number>; openPositions: number }> {
    const response = await api.get<ApiResponse<any>>('/job-posts/stats');
    return response.data.data!;
  },

  async searchCandidatesForJob(jobPostId: string): Promise<Candidate[]> {
    const response = await api.get<ApiResponse<Candidate[]>>(`/job-posts/${jobPostId}/candidates/search`);
    return response.data.data!;
  },

  // ==================== APPLICATIONS ====================

  async createApplication(data: CreateApplicationData): Promise<CandidateApplication> {
    const response = await api.post<ApiResponse<CandidateApplication>>('/job-posts/applications', data);
    return response.data.data!;
  },

  async getApplications(jobPostId?: string, candidateId?: string): Promise<CandidateApplication[]> {
    const params = new URLSearchParams();
    if (jobPostId) params.append('jobPostId', jobPostId);
    if (candidateId) params.append('candidateId', candidateId);

    const response = await api.get<ApiResponse<CandidateApplication[]>>(`/job-posts/applications?${params}`);
    return response.data.data!;
  },

  async getApplicationById(id: string): Promise<CandidateApplication> {
    const response = await api.get<ApiResponse<CandidateApplication>>(`/job-posts/applications/${id}`);
    return response.data.data!;
  },

  async updateApplication(id: string, data: Partial<CandidateApplication>): Promise<CandidateApplication> {
    const response = await api.patch<ApiResponse<CandidateApplication>>(`/job-posts/applications/${id}`, data);
    return response.data.data!;
  },

  async moveApplicationStage(id: string, stage: ApplicationStage, notes?: string): Promise<CandidateApplication> {
    const response = await api.post<ApiResponse<CandidateApplication>>(`/job-posts/applications/${id}/stage`, { stage, notes });
    return response.data.data!;
  },

  async shortlistApplication(id: string, shortlist: boolean): Promise<CandidateApplication> {
    const response = await api.post<ApiResponse<CandidateApplication>>(`/job-posts/applications/${id}/shortlist`, { shortlist });
    return response.data.data!;
  },

  async rejectApplication(id: string, reason?: string): Promise<CandidateApplication> {
    const response = await api.post<ApiResponse<CandidateApplication>>(`/job-posts/applications/${id}/reject`, { reason });
    return response.data.data!;
  },

  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/job-posts/applications/${id}`);
  },

  async getApplicationStats(jobPostId?: string): Promise<{ total: number; byStage: Record<string, number> }> {
    const params = jobPostId ? `?jobPostId=${jobPostId}` : '';
    const response = await api.get<ApiResponse<any>>(`/job-posts/applications/stats${params}`);
    return response.data.data!;
  },

  async getRecruitmentPipeline(jobPostId?: string): Promise<Record<string, CandidateApplication[]>> {
    const params = jobPostId ? `?jobPostId=${jobPostId}` : '';
    const response = await api.get<ApiResponse<any>>(`/job-posts/applications/pipeline${params}`);
    return response.data.data!;
  },

  // ==================== INTERVIEWS ====================

  async scheduleInterview(data: CreateInterviewData): Promise<InterviewRound> {
    const response = await api.post<ApiResponse<InterviewRound>>('/job-posts/interviews', data);
    return response.data.data!;
  },

  async updateInterview(id: string, data: Partial<InterviewRound>): Promise<InterviewRound> {
    const response = await api.patch<ApiResponse<InterviewRound>>(`/job-posts/interviews/${id}`, data);
    return response.data.data!;
  },

  async completeInterview(id: string, feedback: string, rating: number, recommendation: string): Promise<InterviewRound> {
    const response = await api.post<ApiResponse<InterviewRound>>(`/job-posts/interviews/${id}/complete`, { feedback, rating, recommendation });
    return response.data.data!;
  },

  async cancelInterview(id: string): Promise<InterviewRound> {
    const response = await api.post<ApiResponse<InterviewRound>>(`/job-posts/interviews/${id}/cancel`);
    return response.data.data!;
  },

  async deleteInterview(id: string): Promise<void> {
    await api.delete(`/job-posts/interviews/${id}`);
  },

  // ==================== ENUMS ====================

  async getEnums(): Promise<{
    jobStatuses: JobPostStatus[];
    workLocations: WorkLocation[];
    applicationStages: ApplicationStage[];
    interviewTypes: InterviewType[];
  }> {
    const response = await api.get<ApiResponse<any>>('/job-posts/enums');
    return response.data.data!;
  },
};
