import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDaysIcon,
  BanknotesIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  attendanceService,
  leaveService,
  payrollService,
  performanceService,
  loanService,
  documentService,
  LeaveType,
  ReviewCycle,
  DocumentType,
  EmployeeDocument,
} from '@/services/hr.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/authStore';

type TabType = 'mark-attendance' | 'team-attendance' | 'leave' | 'loan' | 'payroll' | 'performance' | 'documents';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const tabs: TabConfig[] = [
  { id: 'mark-attendance', label: 'Mark Attendance', icon: ClipboardDocumentCheckIcon },
  { id: 'team-attendance', label: 'Team Attendance', icon: UserGroupIcon },
  { id: 'leave', label: 'Leave Management', icon: CalendarDaysIcon },
  { id: 'loan', label: 'Loan Management', icon: BanknotesIcon },
  { id: 'documents', label: 'Documents', icon: DocumentTextIcon, adminOnly: true },
  { id: 'payroll', label: 'Payroll', icon: ChartBarIcon, adminOnly: true },
  { id: 'performance', label: 'Performance', icon: StarIcon },
];

const leaveTypeLabels: Record<LeaveType, string> = {
  PAID: 'Paid Leave',
  UNPAID: 'Unpaid Leave',
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  ANNUAL: 'Annual Leave',
  EMERGENCY: 'Emergency Leave',
};

const reviewCycleLabels: Record<ReviewCycle, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half Yearly',
  ANNUAL: 'Annual',
};

export default function HRDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('mark-attendance');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  // Filter tabs based on role
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage attendance, leave, payroll, and performance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {visibleTabs.map((tab) => (
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
      {activeTab === 'mark-attendance' && <MarkAttendanceTab />}
      {activeTab === 'team-attendance' && <TeamAttendanceTab />}
      {activeTab === 'leave' && <LeaveTab isAdmin={isAdmin} />}
      {activeTab === 'loan' && <LoanManagementTab />}
      {activeTab === 'documents' && isAdmin && <DocumentsTab />}
      {activeTab === 'payroll' && isAdmin && <PayrollTab isAdmin={isAdmin} />}
      {activeTab === 'performance' && <PerformanceTab isAdmin={isAdmin} />}
    </div>
  );
}

// ==================== MARK ATTENDANCE TAB (HR marks attendance for employees) ====================

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WORK_FROM_HOME' | 'ON_LEAVE';

const attendanceStatusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'LATE', label: 'Late' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'WORK_FROM_HOME', label: 'Work From Home' },
  { value: 'ON_LEAVE', label: 'On Leave' },
];

function MarkAttendanceTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT' as AttendanceStatus,
    notes: '',
  });

  // Get users list
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
  });

  // Get all attendance records for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['all-attendance-records'],
    queryFn: () => attendanceService.getTeamAttendanceHistory(
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    ),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: attendanceService.markAttendance,
    onSuccess: () => {
      toast.success('Attendance marked successfully!');
      setShowForm(false);
      setFormData({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['all-attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-team-history'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to mark attendance'),
  });

  const handleSubmit = () => {
    if (!formData.userId || !formData.date) {
      toast.error('Please select an employee and date');
      return;
    }
    markAttendanceMutation.mutate({
      userId: formData.userId,
      date: formData.date,
      status: formData.status,
      notes: formData.notes || undefined,
    });
  };

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

  // Get selected employee name for display
  const selectedEmployee = users?.data?.find(u => u.id === formData.userId);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mark Employee Attendance</h2>
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Attendance
        </Button>
      </div>

      {/* Add Attendance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Attendance</h3>

            {/* Series (Auto-generated display) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Series
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 text-sm">
                HR-ATT-.YYYY.- (Auto-generated)
              </div>
            </div>

            {/* Attendance Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attendance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>

            {/* Employee Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="">Select employee</option>
                {users?.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <p className="mt-1 text-xs text-gray-500">
                  Selected: {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
              )}
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

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                rows={2}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.userId || !formData.date || markAttendanceMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading attendance records...</div>
          ) : !attendanceRecords?.length ? (
            <div className="text-center py-8 text-gray-500">No attendance records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Employee Name</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Attendance Date</th>
                    <th className="pb-3 font-medium">Check In</th>
                    <th className="pb-3 font-medium">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {record.user?.firstName} {record.user?.lastName}
                        </span>
                      </td>
                      <td className="py-3">{getStatusBadge(record.status)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
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

// ==================== TEAM ATTENDANCE TAB (All team members can view) ====================

type ViewType = 'today' | 'week' | 'month';

function TeamAttendanceTab() {
  const [viewType, setViewType] = useState<ViewType>('week');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Calculate date range based on view type
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    if (viewType === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (viewType === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Get users list for filter
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
  });

  // Team attendance history
  const { data: teamHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['attendance-team-history', viewType, selectedUserId],
    queryFn: () => attendanceService.getTeamAttendanceHistory(
      startDate.toISOString(),
      endDate.toISOString(),
      selectedUserId || undefined
    ),
  });

  // Team summary
  const { data: teamSummary } = useQuery({
    queryKey: ['attendance-team-summary', viewType],
    queryFn: () => attendanceService.getTeamAttendanceSummary(
      startDate.toISOString(),
      endDate.toISOString()
    ),
  });

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
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
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status] || 'bg-gray-100 text-gray-800')}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Team Summary Cards */}
      {teamSummary && teamSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Team Summary ({viewType === 'today' ? 'Today' : viewType === 'week' ? 'This Week' : 'This Month'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium text-center">Present</th>
                    <th className="pb-3 font-medium text-center">Late</th>
                    <th className="pb-3 font-medium text-center">Absent</th>
                    <th className="pb-3 font-medium text-center">WFH</th>
                    <th className="pb-3 font-medium text-center">Leave</th>
                    <th className="pb-3 font-medium text-center">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {teamSummary.map((item: any) => (
                    <tr key={item.user.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                            {item.user.firstName?.[0]}{item.user.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.user.firstName} {item.user.lastName}
                            </span>
                            <p className="text-xs text-gray-500">{item.user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center text-green-600 font-medium">{item.stats.present}</td>
                      <td className="py-3 text-center text-yellow-600 font-medium">{item.stats.late}</td>
                      <td className="py-3 text-center text-red-600 font-medium">{item.stats.absent}</td>
                      <td className="py-3 text-center text-blue-600 font-medium">{item.stats.wfh}</td>
                      <td className="py-3 text-center text-purple-600 font-medium">{item.stats.onLeave}</td>
                      <td className="py-3 text-center font-medium">{item.stats.totalWorkHours.toFixed(1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Team Attendance History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Team Attendance History
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {/* View Type Filter */}
              <div className="flex rounded-lg overflow-hidden border dark:border-gray-700">
                {(['today', 'week', 'month'] as ViewType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setViewType(type)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium transition-colors',
                      viewType === type
                        ? 'bg-redstone-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {type === 'today' ? 'Today' : type === 'week' ? 'This Week' : 'This Month'}
                  </button>
                ))}
              </div>
              {/* User Filter */}
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm"
              >
                <option value="">All Team Members</option>
                {users?.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">Loading attendance history...</div>
          ) : !teamHistory?.length ? (
            <div className="text-center py-8 text-gray-500">No attendance records for this period</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Check In</th>
                    <th className="pb-3 font-medium">Check Out</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Late By</th>
                  </tr>
                </thead>
                <tbody>
                  {teamHistory.map((att) => (
                    <tr key={att.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3 text-gray-900 dark:text-white font-medium">
                        {formatDate(att.date)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                            {att.user?.firstName?.[0]}{att.user?.lastName?.[0]}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {att.user?.firstName} {att.user?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">{getStatusBadge(att.status)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{formatTime(att.checkIn)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{formatTime(att.checkOut)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {att.workHours ? Number(att.workHours).toFixed(1) : '--'}h
                      </td>
                      <td className="py-3">
                        {att.status === 'LATE' && att.notes ? (
                          <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                            {att.notes.replace('Late by ', '')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
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
    </div>
  );
}

// ==================== LEAVE TAB ====================

function LeaveTab({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();

  const { data: allLeaves } = useQuery({
    queryKey: ['all-leaves'],
    queryFn: () => leaveService.getLeaveRequests(),
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: leaveService.getPendingApprovals,
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: leaveService.approveLeave,
    onSuccess: () => {
      toast.success('Leave approved');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => leaveService.rejectLeave(id),
    onSuccess: () => {
      toast.success('Leave rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to reject'),
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
    <div className="space-y-6">
      {/* Pending Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            Pending Leave Requests ({pendingApprovals?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingApprovals?.length ? (
            <div className="text-center py-8 text-gray-500">No pending leave requests</div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.user?.firstName} {request.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {leaveTypeLabels[request.leaveType]} • {request.totalDays} day(s)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    {request.reason && (
                      <p className="text-xs text-gray-500 mt-1">Reason: {request.reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Leave Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!allLeaves?.length ? (
            <div className="text-center py-8 text-gray-500">No leave requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">From</th>
                    <th className="pb-3 font-medium">To</th>
                    <th className="pb-3 font-medium">Days</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {allLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {leave.user?.firstName} {leave.user?.lastName}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {leaveTypeLabels[leave.leaveType]}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{leave.totalDays}</td>
                      <td className="py-3">{getStatusBadge(leave.status)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                        {leave.reason || '-'}
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

// ==================== PAYROLL TAB ====================

function PayrollTab({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: payrollList, isLoading } = useQuery({
    queryKey: ['payroll', selectedMonth, selectedYear],
    queryFn: () => payrollService.getPayrollList(selectedMonth, selectedYear),
  });

  const generateMutation = useMutation({
    mutationFn: () => payrollService.generatePayroll(selectedMonth, selectedYear),
    onSuccess: () => {
      toast.success('Payroll generated successfully');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to generate payroll'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'DRAFT' | 'PROCESSED' | 'PAID' }) =>
      payrollService.updatePayrollStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const formatCurrency = (amount: number, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      PROCESSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {status}
      </span>
    );
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Generate Payroll
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll - {months[selectedMonth - 1]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading payroll data...</div>
          ) : !payrollList?.length ? (
            <div className="text-center py-8 text-gray-500">
              No payroll records for this period.
              {isAdmin && ' Click "Generate Payroll" to create records.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Base Salary</th>
                    <th className="pb-3 font-medium">Deductions</th>
                    <th className="pb-3 font-medium">Net Salary</th>
                    <th className="pb-3 font-medium">Present Days</th>
                    <th className="pb-3 font-medium">Status</th>
                    {isAdmin && <th className="pb-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollList.map((payroll) => (
                    <tr key={payroll.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                            {payroll.user?.firstName?.[0]}{payroll.user?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {payroll.user?.firstName} {payroll.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{payroll.user?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {formatCurrency(Number(payroll.baseSalary), payroll.currency)}
                      </td>
                      <td className="py-3 text-red-600">
                        -{formatCurrency(Number(payroll.deductions) || 0, payroll.currency)}
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(payroll.netSalary), payroll.currency)}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {payroll.presentDays}/{payroll.workingDays}
                      </td>
                      <td className="py-3">{getStatusBadge(payroll.status)}</td>
                      {isAdmin && (
                        <td className="py-3">
                          <select
                            value={payroll.status}
                            onChange={(e) => updateStatusMutation.mutate({ id: payroll.id, status: e.target.value as any })}
                            className="text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PROCESSED">Processed</option>
                            <option value="PAID">Paid</option>
                          </select>
                        </td>
                      )}
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

// ==================== PERFORMANCE TAB ====================

function PerformanceTab({ isAdmin }: { isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    userId: '',
    cycle: 'QUARTERLY' as ReviewCycle,
    reviewPeriod: '',
    rating: 0,
    strengths: '',
    improvements: '',
    feedback: '',
  });

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => performanceService.getReviews(),
  });

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: performanceService.createReview,
    onSuccess: () => {
      toast.success('Review created');
      setShowCreateModal(false);
      setReviewForm({
        userId: '',
        cycle: 'QUARTERLY',
        reviewPeriod: '',
        rating: 0,
        strengths: '',
        improvements: '',
        feedback: '',
      });
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create review'),
  });

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          ) : !reviews?.length ? (
            <div className="text-center py-8 text-gray-500">No performance reviews found</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium">
                        {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.user?.firstName} {review.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {reviewCycleLabels[review.cycle]} • {review.reviewPeriod}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <StarIcon className="w-5 h-5 fill-current" />
                          <span className="font-bold">{Number(review.rating).toFixed(1)}</span>
                        </div>
                      )}
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        review.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                        review.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                  {review.feedback && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {review.feedback}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Reviewed by: {review.reviewer?.firstName} {review.reviewer?.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Review Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Performance Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee
                </label>
                <select
                  value={reviewForm.userId}
                  onChange={(e) => setReviewForm({ ...reviewForm, userId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                >
                  <option value="">Select employee</option>
                  {users?.data?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Review Cycle
                  </label>
                  <select
                    value={reviewForm.cycle}
                    onChange={(e) => setReviewForm({ ...reviewForm, cycle: e.target.value as ReviewCycle })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  >
                    {Object.entries(reviewCycleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Period
                  </label>
                  <input
                    type="text"
                    value={reviewForm.reviewPeriod}
                    onChange={(e) => setReviewForm({ ...reviewForm, reviewPeriod: e.target.value })}
                    placeholder="e.g., Q1 2025"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strengths
                </label>
                <textarea
                  value={reviewForm.strengths}
                  onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  value={reviewForm.improvements}
                  onChange={(e) => setReviewForm({ ...reviewForm, improvements: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Overall Feedback
                </label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(reviewForm)}
                disabled={!reviewForm.userId || !reviewForm.reviewPeriod || createMutation.isPending}
              >
                Create Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== DOCUMENTS TAB ====================

const documentTypeLabels: Record<DocumentType, string> = {
  CONTRACT: 'Contract',
  ID_CARD: 'ID Card',
  DEGREE: 'Degree',
  CERTIFICATE: 'Certificate',
  OTHER: 'Other',
};

const documentTypeOptions: { value: DocumentType; label: string; required?: boolean }[] = [
  { value: 'CONTRACT', label: 'Contract', required: true },
  { value: 'ID_CARD', label: 'ID Card', required: true },
  { value: 'DEGREE', label: 'Degree' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' },
];

function DocumentsTab() {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; fileName: string; mimeType: string } | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; fileName: string } | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'CONTRACT' as DocumentType,
    title: '',
    notes: '',
    expiryDate: '',
  });

  // State for inline uploads - one file per document type
  const [inlineFiles, setInlineFiles] = useState<Record<DocumentType, File | null>>({
    CONTRACT: null,
    ID_CARD: null,
    DEGREE: null,
    CERTIFICATE: null,
    OTHER: null,
  });
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);

  // Get users list
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
  });

  // Get employees with their document status
  const { data: employeesWithDocs, isLoading } = useQuery({
    queryKey: ['employees-with-documents'],
    queryFn: () => documentService.getEmployeesWithDocuments(),
  });

  // Get documents for selected employee
  const { data: employeeDocs } = useQuery({
    queryKey: ['employee-documents', selectedEmployee],
    queryFn: () => documentService.getDocumentsByUser(selectedEmployee),
    enabled: !!selectedEmployee,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');

      const data = new FormData();
      data.append('file', selectedFile);
      data.append('userId', formData.userId);
      data.append('type', formData.type);
      data.append('title', formData.title || `${documentTypeLabels[formData.type]} - ${users?.data?.find(u => u.id === formData.userId)?.firstName}`);
      if (formData.notes) data.append('notes', formData.notes);
      if (formData.expiryDate) data.append('expiryDate', formData.expiryDate);

      return documentService.uploadDocument(data);
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      setSelectedFile(null);
      setFormData({
        userId: '',
        type: 'CONTRACT',
        title: '',
        notes: '',
        expiryDate: '',
      });
      queryClient.invalidateQueries({ queryKey: ['employees-with-documents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to upload document'),
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['employees-with-documents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete document'),
  });

  // Inline upload mutation
  const inlineUploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: DocumentType }) => {
      const data = new FormData();
      data.append('file', file);
      data.append('userId', selectedEmployee);
      data.append('type', type);
      data.append('title', `${documentTypeLabels[type]} - ${users?.data?.find(u => u.id === selectedEmployee)?.firstName}`);
      return documentService.uploadDocument(data);
    },
    onSuccess: (_, { type }) => {
      toast.success(`${documentTypeLabels[type]} uploaded successfully`);
      setInlineFiles(prev => ({ ...prev, [type]: null }));
      setUploadingType(null);
      queryClient.invalidateQueries({ queryKey: ['employees-with-documents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload document');
      setUploadingType(null);
    },
  });

  const handleInlineFileSelect = (type: DocumentType, file: File | null) => {
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
    }
    setInlineFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleInlineUpload = (type: DocumentType) => {
    const file = inlineFiles[type];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    setUploadingType(type);
    inlineUploadMutation.mutate({ file, type });
  };

  // Upload all selected files at once
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const handleUploadAll = async () => {
    const filesToUpload = Object.entries(inlineFiles).filter(([_, file]) => file !== null) as [DocumentType, File][];

    if (filesToUpload.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploadingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [type, file] of filesToUpload) {
      try {
        const data = new FormData();
        data.append('file', file);
        data.append('userId', selectedEmployee);
        data.append('type', type);
        data.append('title', `${documentTypeLabels[type]} - ${users?.data?.find(u => u.id === selectedEmployee)?.firstName}`);
        await documentService.uploadDocument(data);
        successCount++;
      } catch (err) {
        errorCount++;
      }
    }

    setIsUploadingAll(false);

    // Reset all files
    setInlineFiles({
      CONTRACT: null,
      ID_CARD: null,
      DEGREE: null,
      CERTIFICATE: null,
      OTHER: null,
    });

    if (successCount > 0) {
      toast.success(`${successCount} document(s) uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ['employees-with-documents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} document(s) failed to upload`);
    }
  };

  const selectedFilesCount = Object.values(inlineFiles).filter(f => f !== null).length;

  const handleViewDocument = async (doc: EmployeeDocument) => {
    setIsLoadingView(true);
    try {
      const response = await documentService.downloadDocument(doc.id);
      const mimeType = doc.mimeType || 'application/octet-stream';
      const blob = new Blob([response], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      setViewingDoc({ url, fileName: doc.fileName, mimeType });
    } catch (err) {
      toast.error('Failed to load document');
    } finally {
      setIsLoadingView(false);
    }
  };

  const closeDocumentViewer = () => {
    if (viewingDoc?.url) {
      window.URL.revokeObjectURL(viewingDoc.url);
    }
    setViewingDoc(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const getDocStatusBadge = (hasDoc: boolean, required?: boolean) => {
    if (hasDoc) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Uploaded</span>;
    }
    if (required) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Missing</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Not uploaded</span>;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Documents</h2>
      </div>

      {/* Employees Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Status by Employee</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : !employeesWithDocs?.length ? (
            <div className="text-center py-8 text-gray-500">No employees found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Contract <span className="text-red-500">*</span></th>
                    <th className="pb-3 font-medium">ID Card <span className="text-red-500">*</span></th>
                    <th className="pb-3 font-medium">Degree</th>
                    <th className="pb-3 font-medium">Certificates</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeesWithDocs.map((emp) => {
                    const docStatus = emp.documentStatus || {
                      hasContract: false,
                      hasIdCard: false,
                      hasDegree: false,
                      hasCertificate: false,
                      isComplete: false,
                    };
                    return (
                      <Fragment key={emp.id}>
                      <tr className="border-b dark:border-gray-700 last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <p className="text-xs text-gray-500">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{getDocStatusBadge(docStatus.hasContract, true)}</td>
                        <td className="py-3">{getDocStatusBadge(docStatus.hasIdCard, true)}</td>
                        <td className="py-3">{getDocStatusBadge(docStatus.hasDegree)}</td>
                        <td className="py-3">{getDocStatusBadge(docStatus.hasCertificate)}</td>
                        <td className="py-3">
                          {docStatus.isComplete ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Complete</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Incomplete</span>
                          )}
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            onClick={() => setSelectedEmployee(emp.id)}
                          >
                            Upload Documents
                          </Button>
                        </td>
                      </tr>
                    </Fragment>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Documents Popup Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Documents - {users?.data?.find(u => u.id === selectedEmployee)?.firstName} {users?.data?.find(u => u.id === selectedEmployee)?.lastName}
              </h3>
              <button
                onClick={() => {
                  setSelectedEmployee('');
                  setInlineFiles({ CONTRACT: null, ID_CARD: null, DEGREE: null, CERTIFICATE: null, OTHER: null });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {documentTypeOptions.map((docType) => {
                const docsOfType = employeeDocs?.filter(d => d.type === docType.value) || [];
                const hasDoc = docsOfType.length > 0;

                return (
                  <div key={docType.value} className="p-4 border rounded-lg dark:border-gray-700">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {docType.label} {docType.required && <span className="text-red-500">*</span>}
                    </label>

                    {/* Show existing uploaded documents */}
                    {hasDoc && (
                      <div className="mb-3 space-y-2">
                        {docsOfType.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <DocumentTextIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc.fileName}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleViewDocument(doc)}
                                disabled={isLoadingView}
                                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center gap-1"
                              >
                                <EyeIcon className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await documentService.downloadDocument(doc.id);
                                    const blob = new Blob([response], { type: 'application/octet-stream' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = doc.fileName;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                  } catch (err) {
                                    toast.error('Failed to download document');
                                  }
                                }}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: doc.id, fileName: doc.fileName })}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload new file */}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInlineFileSelect(docType.value, file);
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-redstone-50 file:text-redstone-700 hover:file:bg-redstone-100"
                    />

                    {inlineFiles[docType.value] && (
                      <p className="mt-1 text-sm text-green-600">✓ New: {inlineFiles[docType.value]!.name}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEmployee('');
                  setInlineFiles({ CONTRACT: null, ID_CARD: null, DEGREE: null, CERTIFICATE: null, OTHER: null });
                }}
              >
                Close
              </Button>
              {selectedFilesCount > 0 && (
                <Button
                  onClick={async () => {
                    await handleUploadAll();
                    // Close modal after upload
                    setSelectedEmployee('');
                    setInlineFiles({ CONTRACT: null, ID_CARD: null, DEGREE: null, CERTIFICATE: null, OTHER: null });
                  }}
                  disabled={isUploadingAll}
                >
                  {isUploadingAll ? 'Uploading...' : `Upload (${selectedFilesCount} files)`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {viewingDoc.fileName}
              </h3>
              <button
                onClick={closeDocumentViewer}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-[60vh]">
              {viewingDoc.mimeType?.startsWith('image/') ? (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.fileName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : viewingDoc.mimeType === 'application/pdf' ? (
                <iframe
                  src={viewingDoc.url}
                  className="w-full h-full min-h-[60vh]"
                  title={viewingDoc.fileName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">Preview not available</p>
                  <p className="text-sm mb-4">This file type cannot be previewed in browser</p>
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = viewingDoc.url;
                      a.download = viewingDoc.fileName;
                      a.click();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Document</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to delete this document?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded mb-6 truncate">
              {deleteConfirm.fileName}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  deleteMutation.mutate(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==================== LOAN MANAGEMENT TAB ====================

function LoanManagementTab() {
  const queryClient = useQueryClient();

  const { data: allLoans } = useQuery({
    queryKey: ['all-loans'],
    queryFn: () => loanService.getLoans(),
  });

  const { data: pendingLoans } = useQuery({
    queryKey: ['pending-loans'],
    queryFn: loanService.getPendingLoans,
  });

  const approveMutation = useMutation({
    mutationFn: loanService.approveLoan,
    onSuccess: () => {
      toast.success('Loan approved');
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => loanService.rejectLoan(id),
    onSuccess: () => {
      toast.success('Loan rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to reject'),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => loanService.markLoanPaid(id),
    onSuccess: () => {
      toast.success('Loan marked as paid');
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
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
    <div className="space-y-6">
      {/* Pending Loan Requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            Pending Loan Requests ({pendingLoans?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingLoans?.length ? (
            <div className="text-center py-4 text-gray-500">No pending loan requests</div>
          ) : (
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {loan.user?.firstName} {loan.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(Number(loan.amount))} • {loan.reason || 'No reason provided'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(loan.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(loan.id)}
                      disabled={rejectMutation.isPending}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Loans */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Loan Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {!allLoans?.length ? (
            <div className="text-center py-8 text-gray-500">No loan requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Reason</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Paid</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allLoans.map((loan) => (
                    <tr key={loan.id} className="border-b dark:border-gray-700 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                            {loan.user?.firstName?.[0]}{loan.user?.lastName?.[0]}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {loan.user?.firstName} {loan.user?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(loan.amount))}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                        {loan.reason || '-'}
                      </td>
                      <td className="py-3">{getStatusBadge(loan.status)}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        {loan.paidAmount ? formatCurrency(Number(loan.paidAmount)) : '-'}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {loan.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaidMutation.mutate(loan.id)}
                            disabled={markPaidMutation.isPending}
                          >
                            Mark Paid
                          </Button>
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
    </div>
  );
}
