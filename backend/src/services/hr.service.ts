import { prisma } from '../config/database.js';
import { AttendanceStatus, AttendanceSource, LeaveType, LeaveStatus, PayrollStatus, ReviewCycle } from '@prisma/client';

// ==================== ATTENDANCE SERVICE ====================

export class AttendanceService {
  // Team check-in time: 2:00 PM (14:00)
  private readonly CHECKIN_DEADLINE_HOUR = 14;
  private readonly CHECKIN_DEADLINE_MINUTE = 0;

  async checkIn(userId: string, source: AttendanceSource = 'MANUAL') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing?.checkIn) {
      throw new Error('Already checked in today');
    }

    const now = new Date();

    // Calculate deadline time (2:00 PM)
    const deadline = new Date(today);
    deadline.setHours(this.CHECKIN_DEADLINE_HOUR, this.CHECKIN_DEADLINE_MINUTE, 0, 0);

    // Determine status and calculate late minutes
    let status: AttendanceStatus = 'PRESENT';
    let lateMinutes = 0;

    if (now > deadline) {
      status = 'LATE';
      lateMinutes = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60));
    }

    // Store late minutes in notes field for now
    const lateNote = lateMinutes > 0 ? `Late by ${lateMinutes} minutes` : null;

    if (existing) {
      return prisma.attendance.update({
        where: { id: existing.id },
        data: { checkIn: now, status, source, notes: lateNote },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      });
    }

    return prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: now,
        status,
        source,
        notes: lateNote,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async checkOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!attendance?.checkIn) {
      throw new Error('No check-in found for today');
    }

    if (attendance.checkOut) {
      throw new Error('Already checked out today');
    }

    const now = new Date();
    const checkInTime = new Date(attendance.checkIn);
    const workHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    return prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours: Math.round(workHours * 100) / 100,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async getTodayAttendance(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async getTeamAttendance(date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    return prisma.attendance.findMany({
      where: { date: targetDate },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      orderBy: { checkIn: 'asc' },
    });
  }

  async getAttendanceHistory(userId: string, startDate: Date, endDate: Date) {
    return prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
    });
  }

  // Get all team members attendance for a date range (for HR/Admin)
  async getTeamAttendanceHistory(startDate: Date, endDate: Date, userId?: string) {
    const where: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (userId) {
      where.userId = userId;
    }

    return prisma.attendance.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      orderBy: [{ date: 'desc' }, { checkIn: 'asc' }],
    });
  }

  // Get attendance summary for all users (for HR dashboard)
  async getTeamAttendanceSummary(startDate: Date, endDate: Date) {
    // Get all users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
    });

    // Get all attendance records for the period
    const attendance = await prisma.attendance.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });

    // Calculate summary for each user
    const summary = users.map((user) => {
      const userAttendance = attendance.filter((a) => a.userId === user.id);

      const stats = {
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        wfh: 0,
        onLeave: 0,
        totalWorkHours: 0,
      };

      userAttendance.forEach((a) => {
        switch (a.status) {
          case 'PRESENT': stats.present++; break;
          case 'LATE': stats.late++; break;
          case 'ABSENT': stats.absent++; break;
          case 'HALF_DAY': stats.halfDay++; break;
          case 'WORK_FROM_HOME': stats.wfh++; break;
          case 'ON_LEAVE': stats.onLeave++; break;
        }
        if (a.workHours) {
          stats.totalWorkHours += Number(a.workHours);
        }
      });

      return {
        user,
        stats,
        totalDays: userAttendance.length,
      };
    });

    return summary;
  }

  async getMonthlyStats(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      wfh: 0,
      onLeave: 0,
      totalWorkHours: 0,
    };

    attendance.forEach((a) => {
      switch (a.status) {
        case 'PRESENT': stats.present++; break;
        case 'ABSENT': stats.absent++; break;
        case 'LATE': stats.late++; break;
        case 'HALF_DAY': stats.halfDay++; break;
        case 'WORK_FROM_HOME': stats.wfh++; break;
        case 'ON_LEAVE': stats.onLeave++; break;
      }
      if (a.workHours) {
        stats.totalWorkHours += Number(a.workHours);
      }
    });

    return stats;
  }

  async markAttendance(userId: string, date: Date, status: AttendanceStatus, notes?: string) {
    date.setHours(0, 0, 0, 0);

    return prisma.attendance.upsert({
      where: { userId_date: { userId, date } },
      update: { status, notes, source: 'MANUAL' },
      create: { userId, date, status, notes, source: 'MANUAL' },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  // Auto-calculate attendance from time entries
  async syncFromTimeEntries(userId: string, date: Date) {
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: date, lt: nextDay },
      },
      orderBy: { startTime: 'asc' },
    });

    if (timeEntries.length === 0) return null;

    const firstEntry = timeEntries[0];
    const lastEntry = timeEntries[timeEntries.length - 1];
    const totalDuration = timeEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const workHours = totalDuration / 3600;

    return prisma.attendance.upsert({
      where: { userId_date: { userId, date } },
      update: {
        checkIn: firstEntry.startTime,
        checkOut: lastEntry.endTime,
        workHours: Math.round(workHours * 100) / 100,
        source: 'TIMER',
      },
      create: {
        userId,
        date,
        status: 'PRESENT',
        checkIn: firstEntry.startTime,
        checkOut: lastEntry.endTime,
        workHours: Math.round(workHours * 100) / 100,
        source: 'TIMER',
      },
    });
  }
}

// ==================== LEAVE SERVICE ====================

export class LeaveService {
  async getLeaveBalance(userId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    return prisma.leaveBalance.findMany({
      where: { userId, year: targetYear },
    });
  }

  async initializeLeaveBalance(userId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const leaveTypes: LeaveType[] = ['PAID', 'SICK', 'CASUAL', 'ANNUAL'];
    const defaults: Record<LeaveType, number> = {
      PAID: 12,
      UNPAID: 999,
      SICK: 10,
      CASUAL: 6,
      ANNUAL: 14,
      EMERGENCY: 3,
    };

    const balances = await Promise.all(
      leaveTypes.map((type) =>
        prisma.leaveBalance.upsert({
          where: { userId_year_leaveType: { userId, year: targetYear, leaveType: type } },
          update: {},
          create: { userId, year: targetYear, leaveType: type, total: defaults[type], used: 0 },
        })
      )
    );

    return balances;
  }

  async applyLeave(data: {
    userId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    reason?: string;
  }) {
    const { userId, leaveType, startDate, endDate, reason } = data;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // No balance check - HR will approve/reject the request
    return prisma.leaveRequest.create({
      data: {
        userId,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async getLeaveRequests(filters?: { userId?: string; status?: LeaveStatus }) {
    return prisma.leaveRequest.findMany({
      where: filters,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingApprovals() {
    return prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveLeave(id: string, approverId: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING') throw new Error('Request already processed');

    // Skip balance deduction - balance tracking is optional

    // Mark attendance as on leave
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      await prisma.attendance.upsert({
        where: { userId_date: { userId: request.userId, date } },
        update: { status: 'ON_LEAVE' },
        create: { userId: request.userId, date, status: 'ON_LEAVE' },
      });
    }

    return prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: approverId, approvedAt: new Date() },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async rejectLeave(id: string, approverId: string, reason?: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Leave request not found');
    if (request.status !== 'PENDING') throw new Error('Request already processed');

    return prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', approvedById: approverId, approvedAt: new Date(), rejectionReason: reason },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async cancelLeave(id: string, userId: string) {
    const request = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new Error('Leave request not found');
    if (request.userId !== userId) throw new Error('Unauthorized');
    if (request.status !== 'PENDING') throw new Error('Cannot cancel processed request');

    return prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}

// ==================== PAYROLL SERVICE ====================

export class PayrollService {
  async generatePayroll(month: number, year: number) {
    // Get all active users with monthly salary
    const users = await prisma.user.findMany({
      where: { isActive: true, monthlySalary: { not: null } },
      include: {
        attendance: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0),
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    const payrolls = [];
    const workingDaysInMonth = this.getWorkingDays(month, year);

    for (const user of users) {
      const baseSalary = Number(user.monthlySalary);

      // Per day salary = (Monthly Salary × 12) / 365
      const perDaySalary = (baseSalary * 12) / 365;

      // Build attendance map by date
      const attendanceMap = new Map<string, string>();
      for (const a of user.attendance) {
        const dateKey = new Date(a.date).toISOString().split('T')[0];
        attendanceMap.set(dateKey, a.status);
      }

      // Calculate attendance with sandwich policy
      let presentDays = 0;
      let leaveDays = 0;
      let absentDays = 0;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateKey = d.toISOString().split('T')[0];
        const status = attendanceMap.get(dateKey);

        if (dayOfWeek === 0) {
          // Sunday - Sandwich Policy: follows Saturday's status
          const saturday = new Date(d);
          saturday.setDate(saturday.getDate() - 1);
          const saturdayKey = saturday.toISOString().split('T')[0];
          const saturdayStatus = attendanceMap.get(saturdayKey);

          // If Saturday was PRESENT/LATE/WFH → Sunday is PRESENT
          // If Saturday was ABSENT/no record → Sunday is ABSENT
          if (saturdayStatus === 'PRESENT' || saturdayStatus === 'LATE' || saturdayStatus === 'WORK_FROM_HOME') {
            presentDays++;
          } else if (saturdayStatus === 'ON_LEAVE') {
            leaveDays++;
          } else {
            // Saturday absent or no record = Sunday absent
            absentDays++;
          }
          continue;
        }

        // Working day (Mon-Sat)
        if (status === 'PRESENT' || status === 'LATE' || status === 'WORK_FROM_HOME') {
          presentDays++;
        } else if (status === 'HALF_DAY') {
          presentDays += 0.5;
          absentDays += 0.5;
        } else if (status === 'ON_LEAVE') {
          leaveDays++;
        } else {
          // No attendance record or ABSENT
          absentDays++;
        }
      }

      // Total absent days
      const totalAbsentDays = absentDays;

      // Calculate deductions
      const absentDeduction = totalAbsentDays > 0 ? totalAbsentDays * perDaySalary : 0;
      const netSalary = baseSalary - absentDeduction;

      const payroll = await prisma.payroll.upsert({
        where: { userId_month_year: { userId: user.id, month, year } },
        update: {
          baseSalary,
          deductions: Math.round(absentDeduction),
          netSalary: Math.round(netSalary),
          workingDays: workingDaysInMonth,
          presentDays: Math.round(presentDays),
          leaveDays,
        },
        create: {
          userId: user.id,
          month,
          year,
          baseSalary,
          deductions: Math.round(absentDeduction),
          netSalary: Math.round(netSalary),
          workingDays: workingDaysInMonth,
          presentDays: Math.round(presentDays),
          leaveDays,
        },
      });

      payrolls.push(payroll);
    }

    return payrolls;
  }

  private getWorkingDays(month: number, year: number): number {
    // Return total days in the month
    const end = new Date(year, month, 0);
    return end.getDate();
  }

  async getPayrollList(month?: number, year?: number) {
    const where: any = {};
    if (month) where.month = month;
    if (year) where.year = year;

    return prisma.payroll.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getUserPayrollHistory(userId: string) {
    return prisma.payroll.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async updatePayrollStatus(id: string, status: PayrollStatus) {
    const data: any = { status };
    if (status === 'PAID') {
      data.paidAt = new Date();
    }

    return prisma.payroll.update({
      where: { id },
      data,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}

// ==================== PERFORMANCE SERVICE ====================

export class PerformanceService {
  async createReview(data: {
    userId: string;
    reviewerId: string;
    cycle: ReviewCycle;
    reviewPeriod: string;
    rating?: number;
    goals?: any[];
    strengths?: string;
    improvements?: string;
    feedback?: string;
  }) {
    return prisma.performanceReview.create({
      data: {
        userId: data.userId,
        reviewerId: data.reviewerId,
        cycle: data.cycle,
        reviewPeriod: data.reviewPeriod,
        rating: data.rating,
        goals: data.goals,
        strengths: data.strengths,
        improvements: data.improvements,
        feedback: data.feedback,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getReviews(filters?: { userId?: string; reviewerId?: string; cycle?: ReviewCycle }) {
    return prisma.performanceReview.findMany({
      where: filters,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewById(id: string) {
    return prisma.performanceReview.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateReview(id: string, data: Partial<{
    rating: number;
    goals: any[];
    strengths: string;
    improvements: string;
    feedback: string;
    status: string;
  }>) {
    const updateData: any = { ...data };

    if (data.status === 'SUBMITTED') {
      updateData.submittedAt = new Date();
    } else if (data.status === 'ACKNOWLEDGED') {
      updateData.acknowledgedAt = new Date();
    }

    return prisma.performanceReview.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteReview(id: string) {
    return prisma.performanceReview.delete({ where: { id } });
  }
}

// ==================== DEPARTMENT SERVICE ====================

export class DepartmentService {
  async create(data: { name: string; code: string; description?: string; managerId?: string }) {
    return prisma.department.create({
      data,
      include: { manager: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getAll() {
    return prisma.department.findMany({
      where: { isActive: true },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { employees: true } },
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; code: string; description: string; managerId: string }>) {
    return prisma.department.update({
      where: { id },
      data,
      include: { manager: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async delete(id: string) {
    return prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

// Export service instances
// ==================== LOAN SERVICE ====================

export class LoanService {
  async applyLoan(data: { userId: string; amount: number; reason?: string; dueDate?: Date }) {
    return prisma.loan.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        dueDate: data.dueDate,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async getLoans(filters?: { userId?: string; status?: string }) {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.status) where.status = filters.status;

    return prisma.loan.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingLoans() {
    return prisma.loan.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveLoan(id: string, approverId: string) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'PENDING') throw new Error('Loan already processed');

    return prisma.loan.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: approverId, approvedAt: new Date() },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async rejectLoan(id: string, approverId: string, reason?: string) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new Error('Loan not found');
    if (loan.status !== 'PENDING') throw new Error('Loan already processed');

    return prisma.loan.update({
      where: { id },
      data: { status: 'REJECTED', approvedById: approverId, approvedAt: new Date(), rejectionReason: reason },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async markLoanPaid(id: string, paidAmount?: number) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new Error('Loan not found');
    if (loan.status === 'PENDING' || loan.status === 'REJECTED') throw new Error('Cannot mark unapproved loan as paid');

    const totalPaid = (Number(loan.paidAmount) || 0) + (paidAmount || Number(loan.amount));
    const isPaid = totalPaid >= Number(loan.amount);

    return prisma.loan.update({
      where: { id },
      data: {
        status: isPaid ? 'PAID' : 'PARTIALLY_PAID',
        paidAmount: totalPaid,
        paidAt: isPaid ? new Date() : undefined,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async getUserLoans(userId: string) {
    return prisma.loan.findMany({
      where: { userId },
      include: {
        approvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// ==================== DOCUMENT SERVICE ====================

export class DocumentService {
  async uploadDocument(data: {
    userId: string;
    type: 'CONTRACT' | 'ID_CARD' | 'DEGREE' | 'CERTIFICATE' | 'OTHER';
    title: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    uploadedById?: string;
    notes?: string;
    expiryDate?: Date;
  }) {
    return prisma.employeeDocument.create({
      data,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
  }

  async getDocumentsByUser(userId: string) {
    return prisma.employeeDocument.findMany({
      where: { userId, isActive: true },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getAllDocuments(filters?: { userId?: string; type?: string }) {
    const where: any = { isActive: true };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.type) where.type = filters.type;

    return prisma.employeeDocument.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      orderBy: [{ userId: 'asc' }, { type: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getEmployeesWithDocuments() {
    // Get all employees with their document counts
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        documents: {
          where: { isActive: true },
          select: { id: true, type: true, title: true, fileName: true, filePath: true, createdAt: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return users.map(user => {
      const hasContract = user.documents.some(d => d.type === 'CONTRACT');
      const hasIdCard = user.documents.some(d => d.type === 'ID_CARD');
      const hasDegree = user.documents.some(d => d.type === 'DEGREE');
      const hasCertificate = user.documents.some(d => d.type === 'CERTIFICATE');

      return {
        ...user,
        documentStatus: {
          hasContract,
          hasIdCard,
          hasDegree,
          hasCertificate,
          isComplete: hasContract && hasIdCard,
        },
        documentCounts: {
          contract: user.documents.filter(d => d.type === 'CONTRACT').length,
          idCard: user.documents.filter(d => d.type === 'ID_CARD').length,
          degree: user.documents.filter(d => d.type === 'DEGREE').length,
          certificate: user.documents.filter(d => d.type === 'CERTIFICATE').length,
          other: user.documents.filter(d => d.type === 'OTHER').length,
          total: user.documents.length,
        },
      };
    });
  }

  async deleteDocument(id: string) {
    return prisma.employeeDocument.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getDocumentById(id: string) {
    return prisma.employeeDocument.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}

export const attendanceService = new AttendanceService();
export const leaveService = new LeaveService();
export const payrollService = new PayrollService();
export const performanceService = new PerformanceService();
export const departmentService = new DepartmentService();
export const loanService = new LoanService();
export const documentService = new DocumentService();
