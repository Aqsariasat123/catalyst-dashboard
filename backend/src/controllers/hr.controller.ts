import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types/index.js';
import { sendSuccess } from '../utils/helpers.js';
import {
  attendanceService,
  leaveService,
  payrollService,
  performanceService,
  departmentService,
  loanService,
  documentService,
} from '../services/hr.service.js';

// ==================== VALIDATION SCHEMAS ====================

const markAttendanceSchema = z.object({
  userId: z.string().uuid(),
  date: z.string(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME', 'ON_LEAVE']),
  notes: z.string().optional(),
});

const applyLeaveSchema = z.object({
  leaveType: z.enum(['PAID', 'UNPAID', 'SICK', 'CASUAL', 'ANNUAL', 'EMERGENCY']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

const generatePayrollSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

const createReviewSchema = z.object({
  userId: z.string().uuid(),
  cycle: z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL']),
  reviewPeriod: z.string(),
  rating: z.number().min(0).max(5).optional(),
  goals: z.array(z.any()).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  feedback: z.string().optional(),
});

const createDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
});

const applyLoanSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().optional(),
  dueDate: z.string().optional(),
});

// ==================== ATTENDANCE CONTROLLER ====================

export class AttendanceController {
  async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.checkIn(req.user!.userId);
      sendSuccess(res, result, 'Checked in successfully');
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.checkOut(req.user!.userId);
      sendSuccess(res, result, 'Checked out successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.getTodayAttendance(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getTeamAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const result = await attendanceService.getTeamAttendance(date);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.query.userId as string) || req.user!.userId;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const result = await attendanceService.getAttendanceHistory(userId, startDate, endDate);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.query.userId as string) || req.user!.userId;
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const result = await attendanceService.getMonthlyStats(userId, month, year);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async markAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = markAttendanceSchema.parse(req.body);
      const result = await attendanceService.markAttendance(
        data.userId,
        new Date(data.date),
        data.status,
        data.notes
      );
      sendSuccess(res, result, 'Attendance marked successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get team attendance history for date range (HR/Admin view)
  async getTeamAttendanceHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const userId = req.query.userId as string | undefined;
      const result = await attendanceService.getTeamAttendanceHistory(startDate, endDate, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Get team attendance summary for date range
  async getTeamAttendanceSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const result = await attendanceService.getTeamAttendanceSummary(startDate, endDate);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async syncFromTimeEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.userId;
      const date = new Date(req.body.date || new Date());
      const result = await attendanceService.syncFromTimeEntries(userId, date);
      sendSuccess(res, result, 'Attendance synced from time entries');
    } catch (error) {
      next(error);
    }
  }
}

// ==================== LEAVE CONTROLLER ====================

export class LeaveController {
  async getLeaveBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.query.userId as string) || req.user!.userId;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const result = await leaveService.getLeaveBalance(userId, year);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async initializeBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const year = req.body.year ? parseInt(req.body.year) : undefined;
      const result = await leaveService.initializeLeaveBalance(userId, year);
      sendSuccess(res, result, 'Leave balance initialized');
    } catch (error) {
      next(error);
    }
  }

  async applyLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = applyLeaveSchema.parse(req.body);
      const result = await leaveService.applyLeave({
        userId: req.user!.userId,
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
      });
      sendSuccess(res, result, 'Leave request submitted');
    } catch (error) {
      next(error);
    }
  }

  async getLeaveRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.userId) filters.userId = req.query.userId;
      if (req.query.status) filters.status = req.query.status;
      const result = await leaveService.getLeaveRequests(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.getPendingApprovals();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async approveLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.approveLeave(req.params.id, req.user!.userId);
      sendSuccess(res, result, 'Leave approved');
    } catch (error) {
      next(error);
    }
  }

  async rejectLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.rejectLeave(req.params.id, req.user!.userId, req.body.reason);
      sendSuccess(res, result, 'Leave rejected');
    } catch (error) {
      next(error);
    }
  }

  async cancelLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await leaveService.cancelLeave(req.params.id, req.user!.userId);
      sendSuccess(res, result, 'Leave request cancelled');
    } catch (error) {
      next(error);
    }
  }
}

// ==================== PAYROLL CONTROLLER ====================

export class PayrollController {
  async generatePayroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = generatePayrollSchema.parse(req.body);
      const result = await payrollService.generatePayroll(data.month, data.year);
      sendSuccess(res, result, 'Payroll generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPayrollList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const result = await payrollService.getPayrollList(month, year);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserPayrollHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.userId;
      const result = await payrollService.getUserPayrollHistory(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updatePayrollStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const result = await payrollService.updatePayrollStatus(req.params.id, status);
      sendSuccess(res, result, 'Payroll status updated');
    } catch (error) {
      next(error);
    }
  }
}

// ==================== PERFORMANCE CONTROLLER ====================

export class PerformanceController {
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createReviewSchema.parse(req.body);
      const result = await performanceService.createReview({
        ...data,
        reviewerId: req.user!.userId,
      });
      sendSuccess(res, result, 'Performance review created');
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.userId) filters.userId = req.query.userId;
      if (req.query.reviewerId) filters.reviewerId = req.query.reviewerId;
      if (req.query.cycle) filters.cycle = req.query.cycle;
      const result = await performanceService.getReviews(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getReviewById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.getReviewById(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.updateReview(req.params.id, req.body);
      sendSuccess(res, result, 'Performance review updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await performanceService.deleteReview(req.params.id);
      sendSuccess(res, null, 'Performance review deleted');
    } catch (error) {
      next(error);
    }
  }
}

// ==================== DEPARTMENT CONTROLLER ====================

export class DepartmentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createDepartmentSchema.parse(req.body);
      const result = await departmentService.create(data);
      sendSuccess(res, result, 'Department created');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.getAll();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.update(req.params.id, req.body);
      sendSuccess(res, result, 'Department updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await departmentService.delete(req.params.id);
      sendSuccess(res, null, 'Department deleted');
    } catch (error) {
      next(error);
    }
  }
}

// ==================== LOAN CONTROLLER ====================

export class LoanController {
  async applyLoan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = applyLoanSchema.parse(req.body);
      const result = await loanService.applyLoan({
        userId: req.user!.userId,
        amount: data.amount,
        reason: data.reason,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      sendSuccess(res, result, 'Loan request submitted');
    } catch (error) {
      next(error);
    }
  }

  async getLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.userId) filters.userId = req.query.userId;
      if (req.query.status) filters.status = req.query.status;
      const result = await loanService.getLoans(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMyLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await loanService.getUserLoans(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPendingLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await loanService.getPendingLoans();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async approveLoan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await loanService.approveLoan(req.params.id, req.user!.userId);
      sendSuccess(res, result, 'Loan approved');
    } catch (error) {
      next(error);
    }
  }

  async rejectLoan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await loanService.rejectLoan(req.params.id, req.user!.userId, req.body.reason);
      sendSuccess(res, result, 'Loan rejected');
    } catch (error) {
      next(error);
    }
  }

  async markLoanPaid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await loanService.markLoanPaid(req.params.id, req.body.paidAmount);
      sendSuccess(res, result, 'Loan payment recorded');
    } catch (error) {
      next(error);
    }
  }
}

// ==================== DOCUMENT CONTROLLER ====================

export class DocumentController {
  async uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const { userId, type, title, notes, expiryDate } = req.body;

      const result = await documentService.uploadDocument({
        userId,
        type,
        title,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById: req.user!.userId,
        notes,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      sendSuccess(res, result, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDocumentsByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.userId;
      const result = await documentService.getDocumentsByUser(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAllDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.userId) filters.userId = req.query.userId;
      if (req.query.type) filters.type = req.query.type;
      const result = await documentService.getAllDocuments(filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeesWithDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await documentService.getEmployeesWithDocuments();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentService.deleteDocument(req.params.id);
      sendSuccess(res, null, 'Document deleted');
    } catch (error) {
      next(error);
    }
  }

  async downloadDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const document = await documentService.getDocumentById(req.params.id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      res.download(document.filePath, document.fileName);
    } catch (error) {
      next(error);
    }
  }
}

// Export controller instances
export const attendanceController = new AttendanceController();
export const leaveController = new LeaveController();
export const payrollController = new PayrollController();
export const performanceController = new PerformanceController();
export const departmentController = new DepartmentController();
export const loanController = new LoanController();
export const documentController = new DocumentController();
