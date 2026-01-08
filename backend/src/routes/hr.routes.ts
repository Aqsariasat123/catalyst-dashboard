import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/upload.js';
import {
  attendanceController,
  leaveController,
  payrollController,
  performanceController,
  departmentController,
  loanController,
  documentController,
} from '../controllers/hr.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== ATTENDANCE ROUTES ====================

// Check in/out
router.post('/attendance/check-in', attendanceController.checkIn.bind(attendanceController));
router.post('/attendance/check-out', attendanceController.checkOut.bind(attendanceController));

// Get today's attendance (my attendance)
router.get('/attendance/today', attendanceController.getMyAttendance.bind(attendanceController));

// Get team attendance (Admin/PM)
router.get('/attendance/team', attendanceController.getTeamAttendance.bind(attendanceController));

// Get attendance history
router.get('/attendance/history', attendanceController.getAttendanceHistory.bind(attendanceController));

// Get monthly stats
router.get('/attendance/stats', attendanceController.getMonthlyStats.bind(attendanceController));

// Get team attendance history (HR/Admin - week/month view)
router.get('/attendance/team-history', attendanceController.getTeamAttendanceHistory.bind(attendanceController));

// Get team attendance summary (HR dashboard)
router.get('/attendance/team-summary', attendanceController.getTeamAttendanceSummary.bind(attendanceController));

// Mark attendance (Admin)
router.post('/attendance/mark', attendanceController.markAttendance.bind(attendanceController));

// Sync attendance from time entries
router.post('/attendance/sync/:userId?', attendanceController.syncFromTimeEntries.bind(attendanceController));

// ==================== LEAVE ROUTES ====================

// Get leave balance
router.get('/leave-balance', leaveController.getLeaveBalance.bind(leaveController));

// Initialize leave balance (Admin)
router.post('/leave-balance/:userId/initialize', leaveController.initializeBalance.bind(leaveController));

// Apply for leave
router.post('/leaves', leaveController.applyLeave.bind(leaveController));

// Get leave requests
router.get('/leaves', leaveController.getLeaveRequests.bind(leaveController));

// Get pending approvals (Admin/PM)
router.get('/leaves/pending', leaveController.getPendingApprovals.bind(leaveController));

// Approve leave (Admin/PM)
router.patch('/leaves/:id/approve', leaveController.approveLeave.bind(leaveController));

// Reject leave (Admin/PM)
router.patch('/leaves/:id/reject', leaveController.rejectLeave.bind(leaveController));

// Cancel leave request
router.patch('/leaves/:id/cancel', leaveController.cancelLeave.bind(leaveController));

// ==================== PAYROLL ROUTES ====================

// Generate payroll (Admin)
router.post('/payroll/generate', payrollController.generatePayroll.bind(payrollController));

// Get payroll list
router.get('/payroll', payrollController.getPayrollList.bind(payrollController));

// Get user payroll history
router.get('/payroll/history/:userId?', payrollController.getUserPayrollHistory.bind(payrollController));

// Update payroll status (Admin)
router.patch('/payroll/:id/status', payrollController.updatePayrollStatus.bind(payrollController));

// ==================== PERFORMANCE ROUTES ====================

// Create performance review
router.post('/reviews', performanceController.createReview.bind(performanceController));

// Get performance reviews
router.get('/reviews', performanceController.getReviews.bind(performanceController));

// Get single review
router.get('/reviews/:id', performanceController.getReviewById.bind(performanceController));

// Update performance review
router.patch('/reviews/:id', performanceController.updateReview.bind(performanceController));

// Delete performance review
router.delete('/reviews/:id', performanceController.deleteReview.bind(performanceController));

// ==================== DEPARTMENT ROUTES ====================

// Create department (Admin)
router.post('/departments', departmentController.create.bind(departmentController));

// Get all departments
router.get('/departments', departmentController.getAll.bind(departmentController));

// Update department (Admin)
router.patch('/departments/:id', departmentController.update.bind(departmentController));

// Delete department (Admin)
router.delete('/departments/:id', departmentController.delete.bind(departmentController));

// ==================== LOAN ROUTES ====================

// Apply for loan
router.post('/loans', loanController.applyLoan.bind(loanController));

// Get my loans
router.get('/loans/my', loanController.getMyLoans.bind(loanController));

// Get all loans (Admin/PM)
router.get('/loans', loanController.getLoans.bind(loanController));

// Get pending loans (Admin/PM)
router.get('/loans/pending', loanController.getPendingLoans.bind(loanController));

// Approve loan (Admin/PM)
router.patch('/loans/:id/approve', loanController.approveLoan.bind(loanController));

// Reject loan (Admin/PM)
router.patch('/loans/:id/reject', loanController.rejectLoan.bind(loanController));

// Mark loan as paid (Admin/PM)
router.patch('/loans/:id/paid', loanController.markLoanPaid.bind(loanController));

// ==================== DOCUMENT ROUTES ====================

// Upload employee document (Admin)
router.post('/documents/upload', uploadDocument.single('file'), documentController.uploadDocument.bind(documentController));

// Get all documents with filters
router.get('/documents', documentController.getAllDocuments.bind(documentController));

// Get employees with their document status
router.get('/documents/employees', documentController.getEmployeesWithDocuments.bind(documentController));

// Get documents by user
router.get('/documents/user/:userId', documentController.getDocumentsByUser.bind(documentController));

// Download document
router.get('/documents/:id/download', documentController.downloadDocument.bind(documentController));

// Delete document (Admin)
router.delete('/documents/:id', documentController.deleteDocument.bind(documentController));

export default router;
