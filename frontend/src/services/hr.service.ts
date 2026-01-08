import api from './api';
import { ApiResponse } from '@/types';

// ==================== TYPES ====================

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WORK_FROM_HOME' | 'ON_LEAVE';
export type AttendanceSource = 'MANUAL' | 'AUTO' | 'TIMER';
export type LeaveType = 'PAID' | 'UNPAID' | 'SICK' | 'CASUAL' | 'ANNUAL' | 'EMERGENCY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'PAID';
export type ReviewCycle = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  breakMinutes: number | null;
  source: AttendanceSource;
  notes: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role?: string;
  };
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  wfh: number;
  onLeave: number;
  totalWorkHours: number;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  year: number;
  leaveType: LeaveType;
  total: number;
  used: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: LeaveStatus;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role?: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Payroll {
  id: string;
  userId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number | null;
  deductions: number | null;
  tax: number | null;
  netSalary: number;
  currency: string;
  workingDays: number | null;
  presentDays: number | null;
  leaveDays: number | null;
  status: PayrollStatus;
  paidAt: string | null;
  notes: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role?: string;
  };
}

export interface PerformanceReview {
  id: string;
  userId: string;
  reviewerId: string;
  cycle: ReviewCycle;
  reviewPeriod: string;
  rating: number | null;
  goals: any[] | null;
  strengths: string | null;
  improvements: string | null;
  feedback: string | null;
  status: string;
  submittedAt: string | null;
  acknowledgedAt: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role?: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  managerId: string | null;
  isActive: boolean;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  _count?: {
    employees: number;
  };
}

// ==================== ATTENDANCE SERVICE ====================

export const attendanceService = {
  async checkIn(): Promise<Attendance> {
    const response = await api.post<ApiResponse<Attendance>>('/hr/attendance/check-in');
    return response.data.data!;
  },

  async checkOut(): Promise<Attendance> {
    const response = await api.post<ApiResponse<Attendance>>('/hr/attendance/check-out');
    return response.data.data!;
  },

  async getTodayAttendance(): Promise<Attendance | null> {
    const response = await api.get<ApiResponse<Attendance>>('/hr/attendance/today');
    return response.data.data || null;
  },

  async getTeamAttendance(date?: string): Promise<Attendance[]> {
    const params = date ? `?date=${date}` : '';
    const response = await api.get<ApiResponse<Attendance[]>>(`/hr/attendance/team${params}`);
    return response.data.data!;
  },

  async getAttendanceHistory(userId?: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get<ApiResponse<Attendance[]>>(`/hr/attendance/history?${params}`);
    return response.data.data!;
  },

  async getMonthlyStats(userId?: string, month?: number, year?: number): Promise<AttendanceStats> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const response = await api.get<ApiResponse<AttendanceStats>>(`/hr/attendance/stats?${params}`);
    return response.data.data!;
  },

  async getTeamAttendanceHistory(startDate: string, endDate: string, userId?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (userId) params.append('userId', userId);
    const response = await api.get<ApiResponse<Attendance[]>>(`/hr/attendance/team-history?${params}`);
    return response.data.data!;
  },

  async getTeamAttendanceSummary(startDate: string, endDate: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    const response = await api.get<ApiResponse<any[]>>(`/hr/attendance/team-summary?${params}`);
    return response.data.data!
  },

  async markAttendance(data: { userId: string; date: string; status: AttendanceStatus; notes?: string }): Promise<Attendance> {
    const response = await api.post<ApiResponse<Attendance>>('/hr/attendance/mark', data);
    return response.data.data!;
  },

  async syncFromTimeEntries(userId?: string, date?: string): Promise<Attendance> {
    const response = await api.post<ApiResponse<Attendance>>(`/hr/attendance/sync${userId ? `/${userId}` : ''}`, { date });
    return response.data.data!;
  },
};

// ==================== LEAVE SERVICE ====================

export const leaveService = {
  async getLeaveBalance(userId?: string, year?: number): Promise<LeaveBalance[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (year) params.append('year', String(year));
    const response = await api.get<ApiResponse<LeaveBalance[]>>(`/hr/leave-balance?${params}`);
    return response.data.data!;
  },

  async initializeBalance(userId: string, year?: number): Promise<LeaveBalance[]> {
    const response = await api.post<ApiResponse<LeaveBalance[]>>(`/hr/leave-balance/${userId}/initialize`, { year });
    return response.data.data!;
  },

  async applyLeave(data: { leaveType: LeaveType; startDate: string; endDate: string; reason?: string }): Promise<LeaveRequest> {
    const response = await api.post<ApiResponse<LeaveRequest>>('/hr/leaves', data);
    return response.data.data!;
  },

  async getLeaveRequests(filters?: { userId?: string; status?: LeaveStatus }): Promise<LeaveRequest[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    const response = await api.get<ApiResponse<LeaveRequest[]>>(`/hr/leaves?${params}`);
    return response.data.data!;
  },

  async getPendingApprovals(): Promise<LeaveRequest[]> {
    const response = await api.get<ApiResponse<LeaveRequest[]>>('/hr/leaves/pending');
    return response.data.data!;
  },

  async approveLeave(id: string): Promise<LeaveRequest> {
    const response = await api.patch<ApiResponse<LeaveRequest>>(`/hr/leaves/${id}/approve`);
    return response.data.data!;
  },

  async rejectLeave(id: string, reason?: string): Promise<LeaveRequest> {
    const response = await api.patch<ApiResponse<LeaveRequest>>(`/hr/leaves/${id}/reject`, { reason });
    return response.data.data!;
  },

  async cancelLeave(id: string): Promise<LeaveRequest> {
    const response = await api.patch<ApiResponse<LeaveRequest>>(`/hr/leaves/${id}/cancel`);
    return response.data.data!;
  },
};

// ==================== PAYROLL SERVICE ====================

export const payrollService = {
  async generatePayroll(month: number, year: number): Promise<Payroll[]> {
    const response = await api.post<ApiResponse<Payroll[]>>('/hr/payroll/generate', { month, year });
    return response.data.data!;
  },

  async getPayrollList(month?: number, year?: number): Promise<Payroll[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const response = await api.get<ApiResponse<Payroll[]>>(`/hr/payroll?${params}`);
    return response.data.data!;
  },

  async getUserPayrollHistory(userId?: string): Promise<Payroll[]> {
    const response = await api.get<ApiResponse<Payroll[]>>(`/hr/payroll/history${userId ? `/${userId}` : ''}`);
    return response.data.data!;
  },

  async updatePayrollStatus(id: string, status: PayrollStatus): Promise<Payroll> {
    const response = await api.patch<ApiResponse<Payroll>>(`/hr/payroll/${id}/status`, { status });
    return response.data.data!;
  },
};

// ==================== PERFORMANCE SERVICE ====================

export const performanceService = {
  async createReview(data: {
    userId: string;
    cycle: ReviewCycle;
    reviewPeriod: string;
    rating?: number;
    goals?: any[];
    strengths?: string;
    improvements?: string;
    feedback?: string;
  }): Promise<PerformanceReview> {
    const response = await api.post<ApiResponse<PerformanceReview>>('/hr/reviews', data);
    return response.data.data!;
  },

  async getReviews(filters?: { userId?: string; reviewerId?: string; cycle?: ReviewCycle }): Promise<PerformanceReview[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.reviewerId) params.append('reviewerId', filters.reviewerId);
    if (filters?.cycle) params.append('cycle', filters.cycle);
    const response = await api.get<ApiResponse<PerformanceReview[]>>(`/hr/reviews?${params}`);
    return response.data.data!;
  },

  async getReviewById(id: string): Promise<PerformanceReview> {
    const response = await api.get<ApiResponse<PerformanceReview>>(`/hr/reviews/${id}`);
    return response.data.data!;
  },

  async updateReview(id: string, data: Partial<PerformanceReview>): Promise<PerformanceReview> {
    const response = await api.patch<ApiResponse<PerformanceReview>>(`/hr/reviews/${id}`, data);
    return response.data.data!;
  },

  async deleteReview(id: string): Promise<void> {
    await api.delete(`/hr/reviews/${id}`);
  },
};

// ==================== DEPARTMENT SERVICE ====================

export const departmentService = {
  async create(data: { name: string; code: string; description?: string; managerId?: string }): Promise<Department> {
    const response = await api.post<ApiResponse<Department>>('/hr/departments', data);
    return response.data.data!;
  },

  async getAll(): Promise<Department[]> {
    const response = await api.get<ApiResponse<Department[]>>('/hr/departments');
    return response.data.data!;
  },

  async update(id: string, data: Partial<{ name: string; code: string; description: string; managerId: string }>): Promise<Department> {
    const response = await api.patch<ApiResponse<Department>>(`/hr/departments/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/hr/departments/${id}`);
  },
};

// ==================== LOAN TYPES ====================

export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'PARTIALLY_PAID';

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  reason: string | null;
  status: LoanStatus;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  paidAmount: number | null;
  paidAt: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role?: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ==================== LOAN SERVICE ====================

export const loanService = {
  async applyLoan(data: { amount: number; reason?: string; dueDate?: string }): Promise<Loan> {
    const response = await api.post<ApiResponse<Loan>>('/hr/loans', data);
    return response.data.data!;
  },

  async getMyLoans(): Promise<Loan[]> {
    const response = await api.get<ApiResponse<Loan[]>>('/hr/loans/my');
    return response.data.data!;
  },

  async getLoans(filters?: { userId?: string; status?: LoanStatus }): Promise<Loan[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    const response = await api.get<ApiResponse<Loan[]>>(`/hr/loans?${params}`);
    return response.data.data!;
  },

  async getPendingLoans(): Promise<Loan[]> {
    const response = await api.get<ApiResponse<Loan[]>>('/hr/loans/pending');
    return response.data.data!;
  },

  async approveLoan(id: string): Promise<Loan> {
    const response = await api.patch<ApiResponse<Loan>>(`/hr/loans/${id}/approve`);
    return response.data.data!;
  },

  async rejectLoan(id: string, reason?: string): Promise<Loan> {
    const response = await api.patch<ApiResponse<Loan>>(`/hr/loans/${id}/reject`, { reason });
    return response.data.data!;
  },

  async markLoanPaid(id: string, paidAmount?: number): Promise<Loan> {
    const response = await api.patch<ApiResponse<Loan>>(`/hr/loans/${id}/paid`, { paidAmount });
    return response.data.data!;
  },
};

// ==================== DOCUMENT TYPES ====================

export type DocumentType = 'CONTRACT' | 'ID_CARD' | 'DEGREE' | 'CERTIFICATE' | 'OTHER';

export interface EmployeeDocument {
  id: string;
  userId: string;
  type: DocumentType;
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedById: string | null;
  notes: string | null;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface EmployeeWithDocuments {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: string;
  documents: EmployeeDocument[];
  documentStatus: {
    hasContract: boolean;
    hasIdCard: boolean;
    hasDegree: boolean;
    hasCertificate: boolean;
    isComplete: boolean;
  };
}

// ==================== DOCUMENT SERVICE ====================

export const documentService = {
  async uploadDocument(formData: FormData): Promise<EmployeeDocument> {
    const response = await api.post<ApiResponse<EmployeeDocument>>('/hr/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  async getAllDocuments(filters?: { userId?: string; type?: DocumentType }): Promise<EmployeeDocument[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.type) params.append('type', filters.type);
    const response = await api.get<ApiResponse<EmployeeDocument[]>>(`/hr/documents?${params}`);
    return response.data.data!;
  },

  async getEmployeesWithDocuments(): Promise<EmployeeWithDocuments[]> {
    const response = await api.get<ApiResponse<EmployeeWithDocuments[]>>('/hr/documents/employees');
    return response.data.data!;
  },

  async getDocumentsByUser(userId: string): Promise<EmployeeDocument[]> {
    const response = await api.get<ApiResponse<EmployeeDocument[]>>(`/hr/documents/user/${userId}`);
    return response.data.data!;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/hr/documents/${id}`);
  },

  async downloadDocument(id: string): Promise<ArrayBuffer> {
    const response = await api.get(`/hr/documents/${id}/download`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  getDownloadUrl(id: string): string {
    return `${api.defaults.baseURL}/hr/documents/${id}/download`;
  },
};
