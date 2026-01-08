import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClockIcon,
  CalendarDaysIcon,
  PlusIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  attendanceService,
  leaveService,
  loanService,
  LeaveType,
} from '@/services/hr.service';
import { useAuthStore } from '@/stores/authStore';

const leaveTypeLabels: Record<LeaveType, string> = {
  PAID: 'Paid Leave',
  UNPAID: 'Unpaid Leave',
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  ANNUAL: 'Annual Leave',
  EMERGENCY: 'Emergency Leave',
};

type TabType = 'attendance' | 'leave' | 'loan';

export default function EmployeePortalPage() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: ClockIcon },
    { id: 'leave', label: 'Leave', icon: CalendarDaysIcon },
    { id: 'loan', label: 'Loan', icon: BanknotesIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Portal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Mark attendance, apply for leave, request loans
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-700 dark:text-redstone-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'attendance' && <AttendanceTab />}
      {activeTab === 'leave' && <LeaveTab />}
      {activeTab === 'loan' && <LoanTab />}
    </div>
  );
}

// ==================== ATTENDANCE TAB ====================

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WORK_FROM_HOME' | 'ON_LEAVE';

const attendanceStatusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'LATE', label: 'Late' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'WORK_FROM_HOME', label: 'Work From Home' },
  { value: 'ON_LEAVE', label: 'On Leave' },
];

function AttendanceTab() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);

  // Get current time for default values
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    checkInTime: getCurrentTime(),
    checkOutTime: '',
    status: 'PRESENT' as AttendanceStatus,
    lateEntry: false,
    earlyExit: false,
  });

  // Check if time is after 2 PM (14:00)
  const isLateCheckIn = (time: string) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours > 14 || (hours === 14 && minutes > 0);
  };

  // Auto-update late entry when check-in time changes
  const handleCheckInTimeChange = (time: string) => {
    const isLate = isLateCheckIn(time);
    setFormData({
      ...formData,
      checkInTime: time,
      lateEntry: isLate,
      status: isLate ? 'LATE' : formData.status === 'LATE' ? 'PRESENT' : formData.status
    });
  };

  // Get my attendance history for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data: myHistory, isLoading } = useQuery({
    queryKey: ['my-attendance-history'],
    queryFn: () => attendanceService.getAttendanceHistory(
      undefined,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      toast.success('Attendance marked successfully!');
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        checkInTime: getCurrentTime(),
        checkOutTime: '',
        status: 'PRESENT',
        lateEntry: false,
        earlyExit: false,
      });
      queryClient.invalidateQueries({ queryKey: ['my-attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to mark attendance'),
  });

  // Today's date - attendance can only be marked for today
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PRESENT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      ABSENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      LATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      HALF_DAY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      WORK_FROM_HOME: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      ON_LEAVE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    const labels: Record<string, string> = {
      PRESENT: 'Present',
      ABSENT: 'Absent',
      LATE: 'Late',
      HALF_DAY: 'Half Day',
      WORK_FROM_HOME: 'WFH',
      ON_LEAVE: 'On Leave',
    };
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status] || 'bg-gray-100 text-gray-800')}>
        {labels[status] || status}
      </span>
    );
  };

  // Get employee full name
  const employeeName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance</h2>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Mark Attendance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Attendance</h3>

            {/* Attendance Date - Locked to today */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attendance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={today}
                readOnly
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 px-3 py-2 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Attendance can only be marked for today</p>
            </div>

            {/* Employee Name (Auto-filled, read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeName}
                readOnly
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 px-3 py-2 text-gray-700 dark:text-gray-300"
              />
            </div>

            {/* Status Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AttendanceStatus })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                {attendanceStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-in & Check-out Time */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check In Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleCheckInTimeChange(e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2",
                    isLateCheckIn(formData.checkInTime)
                      ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  )}
                />
                {isLateCheckIn(formData.checkInTime) && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Late check-in (after 2:00 PM)</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check Out Time
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.lateEntry}
                    onChange={(e) => setFormData({ ...formData, lateEntry: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-redstone-600 focus:ring-redstone-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Late Entry</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.earlyExit}
                    onChange={(e) => setFormData({ ...formData, earlyExit: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-redstone-600 focus:ring-redstone-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Early Exit</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => markAttendanceMutation.mutate()}
                disabled={markAttendanceMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading attendance records...</div>
          ) : !myHistory?.length ? (
            <div className="text-center py-4 text-gray-500">No attendance records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-2 font-medium">Employee Name</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Attendance Date</th>
                    <th className="pb-2 font-medium">Check In</th>
                    <th className="pb-2 font-medium">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {myHistory.map((att) => (
                    <tr key={att.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-2 font-medium text-gray-900 dark:text-white">
                        {employeeName}
                      </td>
                      <td className="py-2">{getStatusBadge(att.status)}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {formatDate(att.date)}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {att.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== LEAVE TAB ====================

function LeaveTab() {
  const queryClient = useQueryClient();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { data: myLeaves } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => leaveService.getLeaveRequests(),
  });

  const applyLeaveMutation = useMutation({
    mutationFn: leaveService.applyLeave,
    onSuccess: () => {
      toast.success('Leave request submitted');
      setShowApplyModal(false);
      setLeaveForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to apply leave'),
  });

  const cancelMutation = useMutation({
    mutationFn: leaveService.cancelLeave,
    onSuccess: () => {
      toast.success('Leave request cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowApplyModal(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-1" />
          Apply Leave
        </Button>
      </div>

      {/* My Leave Requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!myLeaves?.length ? (
            <div className="text-center py-4 text-gray-500">No leave requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">From</th>
                    <th className="pb-2 font-medium">To</th>
                    <th className="pb-2 font-medium">Days</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-2 font-medium text-gray-900 dark:text-white">
                        {leaveTypeLabels[leave.leaveType]}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{leave.totalDays}</td>
                      <td className="py-2">{getStatusBadge(leave.status)}</td>
                      <td className="py-2">
                        {leave.status === 'PENDING' && (
                          <button
                            onClick={() => cancelMutation.mutate(leave.id)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Apply for Leave</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as LeaveType })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                >
                  {Object.entries(leaveTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  placeholder="Enter reason for leave..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => applyLeaveMutation.mutate(leaveForm)}
                disabled={!leaveForm.startDate || !leaveForm.endDate || applyLeaveMutation.isPending}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== LOAN TAB ====================

function LoanTab() {
  const queryClient = useQueryClient();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: '',
    reason: '',
  });

  const { data: myLoans } = useQuery({
    queryKey: ['my-loans'],
    queryFn: loanService.getMyLoans,
  });

  const applyLoanMutation = useMutation({
    mutationFn: loanService.applyLoan,
    onSuccess: () => {
      toast.success('Loan request submitted');
      setShowApplyModal(false);
      setLoanForm({ amount: '', reason: '' });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to apply for loan'),
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PARTIALLY_PAID: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      APPROVED: 'Approved (Unpaid)',
      REJECTED: 'Rejected',
      PAID: 'Paid',
      PARTIALLY_PAID: 'Partially Paid',
    };
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {labels[status] || status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowApplyModal(true)} size="sm">
          <PlusIcon className="w-4 h-4 mr-1" />
          Apply for Loan
        </Button>
      </div>

      {/* My Loan Requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Loan Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!myLoans?.length ? (
            <div className="text-center py-4 text-gray-500">No loan requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Reason</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Paid</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myLoans.map((loan) => (
                    <tr key={loan.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-2 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(loan.amount))}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                        {loan.reason || '-'}
                      </td>
                      <td className="py-2">{getStatusBadge(loan.status)}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {loan.paidAmount ? formatCurrency(Number(loan.paidAmount)) : '-'}
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Loan Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Apply for Loan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (PKR)
                </label>
                <input
                  type="number"
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  placeholder="Enter amount..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  value={loanForm.reason}
                  onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  placeholder="Enter reason for loan..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => applyLoanMutation.mutate({ amount: parseFloat(loanForm.amount), reason: loanForm.reason })}
                disabled={!loanForm.amount || applyLoanMutation.isPending}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
