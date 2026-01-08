import api from './api';
import { ApiResponse } from '@/types';

// ==================== TYPES ====================

export type TechStack =
  | 'REACT' | 'ANGULAR' | 'VUE' | 'NEXTJS' | 'NODE' | 'EXPRESS' | 'NESTJS' | 'PYTHON' | 'DJANGO' | 'FASTAPI'
  | 'JAVA' | 'SPRING' | 'DOTNET' | 'PHP' | 'LARAVEL' | 'RUBY' | 'RAILS' | 'GO' | 'RUST' | 'FLUTTER'
  | 'REACT_NATIVE' | 'ANDROID' | 'IOS' | 'SWIFT' | 'KOTLIN' | 'DEVOPS' | 'AWS' | 'AZURE' | 'GCP' | 'DOCKER'
  | 'KUBERNETES' | 'QA' | 'AUTOMATION' | 'MANUAL_TESTING' | 'UI_UX' | 'GRAPHIC_DESIGN' | 'FIGMA'
  | 'PHOTOSHOP' | 'AI_ML' | 'DATA_SCIENCE' | 'BLOCKCHAIN' | 'OTHER';

export type CandidateStatus =
  | 'NEW' | 'SCREENING' | 'INTERVIEW' | 'TECHNICAL' | 'HR_ROUND' | 'OFFERED' | 'HIRED' | 'REJECTED' | 'ON_HOLD';

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
  status: CandidateStatus;
  source: string | null;
  notes: string | null;
  rating: number | null;
  interviewDate: string | null;
  appliedFor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateFilters {
  techStack?: TechStack[];
  status?: CandidateStatus;
  search?: string;
  minExperience?: number;
  maxExperience?: number;
}

export interface CreateCandidateData {
  name: string;
  email?: string;
  phone?: string;
  techStack?: TechStack[];
  experience?: number;
  currentCtc?: number;
  expectedCtc?: number;
  noticePeriod?: number;
  cvUrl?: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  source?: string;
  notes?: string;
  appliedFor?: string;
}

export interface RecruitmentStats {
  total: number;
  byStatus: Record<string, number>;
  byTechStack: Record<string, number>;
}

// Tech stack display names
export const techStackLabels: Record<TechStack, string> = {
  REACT: 'React',
  ANGULAR: 'Angular',
  VUE: 'Vue.js',
  NEXTJS: 'Next.js',
  NODE: 'Node.js',
  EXPRESS: 'Express',
  NESTJS: 'NestJS',
  PYTHON: 'Python',
  DJANGO: 'Django',
  FASTAPI: 'FastAPI',
  JAVA: 'Java',
  SPRING: 'Spring',
  DOTNET: '.NET',
  PHP: 'PHP',
  LARAVEL: 'Laravel',
  RUBY: 'Ruby',
  RAILS: 'Rails',
  GO: 'Go',
  RUST: 'Rust',
  FLUTTER: 'Flutter',
  REACT_NATIVE: 'React Native',
  ANDROID: 'Android',
  IOS: 'iOS',
  SWIFT: 'Swift',
  KOTLIN: 'Kotlin',
  DEVOPS: 'DevOps',
  AWS: 'AWS',
  AZURE: 'Azure',
  GCP: 'GCP',
  DOCKER: 'Docker',
  KUBERNETES: 'Kubernetes',
  QA: 'QA',
  AUTOMATION: 'Automation',
  MANUAL_TESTING: 'Manual Testing',
  UI_UX: 'UI/UX',
  GRAPHIC_DESIGN: 'Graphic Design',
  FIGMA: 'Figma',
  PHOTOSHOP: 'Photoshop',
  AI_ML: 'AI/ML',
  DATA_SCIENCE: 'Data Science',
  BLOCKCHAIN: 'Blockchain',
  OTHER: 'Other',
};

// Status display names and colors
export const statusConfig: Record<CandidateStatus, { label: string; color: string }> = {
  NEW: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  SCREENING: { label: 'Screening', color: 'bg-purple-100 text-purple-800' },
  INTERVIEW: { label: 'Interview', color: 'bg-yellow-100 text-yellow-800' },
  TECHNICAL: { label: 'Technical', color: 'bg-orange-100 text-orange-800' },
  HR_ROUND: { label: 'HR Round', color: 'bg-indigo-100 text-indigo-800' },
  OFFERED: { label: 'Offered', color: 'bg-green-100 text-green-800' },
  HIRED: { label: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  ON_HOLD: { label: 'On Hold', color: 'bg-gray-100 text-gray-800' },
};

// ==================== SERVICE ====================

export const recruitmentService = {
  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    const response = await api.post<ApiResponse<Candidate>>('/recruitment/candidates', data);
    return response.data.data!;
  },

  async getCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
    const params = new URLSearchParams();

    if (filters?.techStack && filters.techStack.length > 0) {
      filters.techStack.forEach(ts => params.append('techStack', ts));
    }
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.minExperience !== undefined) params.append('minExperience', String(filters.minExperience));
    if (filters?.maxExperience !== undefined) params.append('maxExperience', String(filters.maxExperience));

    const response = await api.get<ApiResponse<Candidate[]>>(`/recruitment/candidates?${params}`);
    return response.data.data!;
  },

  async getCandidateById(id: string): Promise<Candidate> {
    const response = await api.get<ApiResponse<Candidate>>(`/recruitment/candidates/${id}`);
    return response.data.data!;
  },

  async updateCandidate(id: string, data: Partial<CreateCandidateData & { status?: CandidateStatus; rating?: number; interviewDate?: string }>): Promise<Candidate> {
    const response = await api.patch<ApiResponse<Candidate>>(`/recruitment/candidates/${id}`, data);
    return response.data.data!;
  },

  async updateCandidateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    const response = await api.patch<ApiResponse<Candidate>>(`/recruitment/candidates/${id}/status`, { status });
    return response.data.data!;
  },

  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/recruitment/candidates/${id}`);
  },

  async scheduleInterview(id: string, interviewDate: string): Promise<Candidate> {
    const response = await api.post<ApiResponse<Candidate>>(`/recruitment/candidates/${id}/schedule-interview`, { interviewDate });
    return response.data.data!;
  },

  async rateCandidate(id: string, rating: number): Promise<Candidate> {
    const response = await api.post<ApiResponse<Candidate>>(`/recruitment/candidates/${id}/rate`, { rating });
    return response.data.data!;
  },

  async getStats(): Promise<RecruitmentStats> {
    const response = await api.get<ApiResponse<RecruitmentStats>>('/recruitment/stats');
    return response.data.data!;
  },

  async getTechStacks(): Promise<TechStack[]> {
    const response = await api.get<ApiResponse<TechStack[]>>('/recruitment/tech-stacks');
    return response.data.data!;
  },

  async getStatuses(): Promise<CandidateStatus[]> {
    const response = await api.get<ApiResponse<CandidateStatus[]>>('/recruitment/statuses');
    return response.data.data!;
  },

  async uploadCV(candidateId: string, file: File): Promise<Candidate> {
    const formData = new FormData();
    formData.append('cv', file);
    const response = await api.post<ApiResponse<Candidate>>(`/recruitment/candidates/${candidateId}/upload-cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  getCVDownloadUrl(candidateId: string): string {
    return `${api.defaults.baseURL}/recruitment/candidates/${candidateId}/cv/download`;
  },
};
