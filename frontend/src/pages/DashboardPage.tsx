import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardStats, DeveloperStats } from '@/types';
import ActiveTimerWidget from '@/components/dashboard/ActiveTimerWidget';
import { cn, formatDate } from '@/utils/helpers';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: dashboardService.getAdminDashboard,
    enabled: isAdmin,
  });

  const { data: developerData, isLoading: developerLoading } = useQuery({
    queryKey: ['developerDashboard'],
    queryFn: dashboardService.getDeveloperDashboard,
    enabled: !isAdmin,
  });

  const isLoading = isAdmin ? adminLoading : developerLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isAdmin && adminData) {
    return <AdminDashboard stats={adminData} userName={user?.firstName || ''} />;
  }

  if (!isAdmin && developerData) {
    return <DeveloperDashboard stats={developerData} userName={user?.firstName || ''} />;
  }

  return <DashboardSkeleton />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

function AdminDashboard({ stats, userName }: { stats: DashboardStats; userName: string }) {
  const totalTasks = Object.values(stats.tasksByStatus).reduce((a, b) => a + b, 0);
  const completedTasks = stats.tasksByStatus.COMPLETED || 0;
  const inProgressTasks = stats.tasksByStatus.IN_PROGRESS || 0;
  const todoTasks = stats.tasksByStatus.TODO || 0;
  const blockedTasks = stats.tasksByStatus.BLOCKED || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalProjects = Object.values(stats.projectsByStatus).reduce((a, b) => a + b, 0);
  const activeProjects = stats.projectsByStatus.IN_PROGRESS || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400">
              {totalTasks} Tasks
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {userName}. Here's your project overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Live</span>
          </div>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-redstone-500/20"
          >
            View Projects
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Key Metrics - Compact Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Active Projects"
          value={activeProjects}
          total={totalProjects}
          icon={FolderIcon}
          variant="primary"
        />
        <MetricCard
          label="Total Tasks"
          value={totalTasks}
          icon={ClipboardDocumentListIcon}
          variant="default"
        />
        <MetricCard
          label="In Progress"
          value={inProgressTasks}
          icon={PlayCircleIcon}
          variant="warning"
        />
        <MetricCard
          label="Completed"
          value={completedTasks}
          icon={CheckCircleIcon}
          variant="success"
        />
        <MetricCard
          label="Clients"
          value={stats.totalClients}
          icon={BuildingOffice2Icon}
          variant="default"
        />
        <MetricCard
          label="Hours Tracked"
          value={`${stats.totalTrackedHours}h`}
          icon={ClockIcon}
          variant="default"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Overview - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Task Overview</h3>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400">
              {completionRate}% complete
            </span>
          </div>
          <div className="p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  title={`Completed: ${completedTasks}`}
                />
                <div
                  className="bg-cyan-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                  title={`In Progress: ${inProgressTasks}`}
                />
                <div
                  className="bg-purple-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? ((stats.tasksByStatus.IN_REVIEW || 0) / totalTasks) * 100 : 0}%` }}
                  title={`In Review: ${stats.tasksByStatus.IN_REVIEW || 0}`}
                />
                <div
                  className="bg-gray-400 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }}
                  title={`To Do: ${todoTasks}`}
                />
                <div
                  className="bg-redstone-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (blockedTasks / totalTasks) * 100 : 0}%` }}
                  title={`Blocked: ${blockedTasks}`}
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs">
                <StatusLegend color="green" label="Completed" count={completedTasks} />
                <StatusLegend color="cyan" label="In Progress" count={inProgressTasks} />
                <StatusLegend color="purple" label="In Review" count={stats.tasksByStatus.IN_REVIEW || 0} />
                <StatusLegend color="gray" label="To Do" count={todoTasks} />
                <StatusLegend color="red" label="Blocked" count={blockedTasks} />
              </div>
            </div>

            {/* Task Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatusCard status="TODO" count={todoTasks} total={totalTasks} />
              <StatusCard status="IN_PROGRESS" count={inProgressTasks} total={totalTasks} />
              <StatusCard status="IN_REVIEW" count={stats.tasksByStatus.IN_REVIEW || 0} total={totalTasks} />
              <StatusCard status="COMPLETED" count={completedTasks} total={totalTasks} />
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Projects by Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.projectsByStatus).map(([status, count]) => (
                <ProjectStatusRow key={status} status={status} count={count} total={totalProjects} />
              ))}
            </div>
            <Link
              to="/projects"
              className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-redstone-600 dark:text-redstone-400 border border-redstone-200 dark:border-redstone-500/30 hover:bg-redstone-50 dark:hover:bg-redstone-500/10 rounded-lg transition-colors"
            >
              Manage Projects
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Avg. Completion Time"
          value="3.2 days"
          change="+5%"
          isPositive={false}
          icon={CalendarDaysIcon}
        />
        <QuickStatCard
          title="Team Productivity"
          value={`${completionRate}%`}
          change="+12%"
          isPositive={true}
          icon={ArrowTrendingUpIcon}
        />
        <QuickStatCard
          title="Blocked Tasks"
          value={blockedTasks}
          change={blockedTasks > 0 ? 'Needs attention' : 'All clear'}
          isPositive={blockedTasks === 0}
          icon={ExclamationTriangleIcon}
        />
        <QuickStatCard
          title="Team Members"
          value={stats.totalDevelopers}
          subtitle="Active developers"
          icon={UserGroupIcon}
        />
      </div>

      {/* Recent Activity */}
      {stats.recentActivities && stats.recentActivities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats.recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-redstone-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">{activity.userName}</span>
                  {' '}{activity.action} {activity.entityType.toLowerCase()}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(activity.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DeveloperDashboard({ stats, userName }: { stats: DeveloperStats; userName: string }) {
  const completionRate = stats.assignedTasks > 0
    ? Math.round((stats.completedTasks / stats.assignedTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {userName}. Here's your work summary.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Online</span>
        </div>
      </div>

      {/* Timer Widget + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ActiveTimerWidget />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Assigned"
            value={stats.assignedTasks}
            icon={ClipboardDocumentListIcon}
            variant="default"
          />
          <MetricCard
            label="In Progress"
            value={stats.inProgressTasks}
            icon={PlayCircleIcon}
            variant="warning"
          />
          <MetricCard
            label="Completed"
            value={stats.completedTasks}
            icon={CheckCircleIcon}
            variant="success"
          />
          <MetricCard
            label="Completion"
            value={`${completionRate}%`}
            icon={ChartBarIcon}
            variant="primary"
          />
        </div>
      </div>

      {/* Time Tracking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TimeCard
          title="Today"
          hours={0}
          subtitle="Hours tracked"
          variant="primary"
        />
        <TimeCard
          title="This Week"
          hours={stats.weeklyHours}
          subtitle="Hours tracked"
          variant="default"
        />
        <TimeCard
          title="This Month"
          hours={stats.monthlyHours}
          subtitle="Hours tracked"
          variant="success"
        />
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Your Progress</h3>
          <Link
            to="/tasks"
            className="text-sm font-medium text-redstone-600 dark:text-redstone-400 hover:text-redstone-700 dark:hover:text-redstone-300 transition-colors"
          >
            View all tasks
          </Link>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Task Completion</span>
                <span className="font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-redstone-500 to-redstone-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrackedHours}h</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.assignedTasks}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedTasks}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  label,
  value,
  total,
  icon: Icon,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  total?: number;
  icon: React.ElementType;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}) {
  const variants = {
    default: {
      icon: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      hover: 'hover:border-gray-300 dark:hover:border-gray-600',
    },
    primary: {
      icon: 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400',
      hover: 'hover:border-redstone-300 dark:hover:border-redstone-500/50',
    },
    success: {
      icon: 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400',
      hover: 'hover:border-green-300 dark:hover:border-green-500/50',
    },
    warning: {
      icon: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
      hover: 'hover:border-amber-300 dark:hover:border-amber-500/50',
    },
    danger: {
      icon: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400',
      hover: 'hover:border-red-300 dark:hover:border-red-500/50',
    },
  };

  const style = variants[variant];

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-200 hover:shadow-md",
      style.hover
    )}>
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', style.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {value}
            {total !== undefined && (
              <span className="text-sm font-normal text-gray-400">/{total}</span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusLegend({ color, label, count }: { color: string; label: string; count: number }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-400',
    red: 'bg-redstone-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', colorMap[color])} />
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
    </div>
  );
}

function StatusCard({ status, count, total }: { status: string; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const config: Record<string, { bg: string; text: string; label: string }> = {
    TODO: { bg: 'bg-gray-50 dark:bg-gray-700/50', text: 'text-gray-600 dark:text-gray-300', label: 'To Do' },
    IN_PROGRESS: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', label: 'In Progress' },
    IN_REVIEW: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', label: 'In Review' },
    COMPLETED: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', label: 'Completed' },
  };
  const { bg, text, label } = config[status] || config.TODO;

  return (
    <div className={cn('rounded-lg p-3 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors cursor-default', bg)}>
      <p className={cn('text-2xl font-bold', text)}>{count}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{percentage}%</p>
    </div>
  );
}

function ProjectStatusRow({ status, count, total }: { status: string; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const config: Record<string, { color: string; label: string }> = {
    PLANNING: { color: 'bg-amber-500', label: 'Planning' },
    IN_PROGRESS: { color: 'bg-cyan-500', label: 'In Progress' },
    ON_HOLD: { color: 'bg-orange-500', label: 'On Hold' },
    COMPLETED: { color: 'bg-green-500', label: 'Completed' },
    CANCELLED: { color: 'bg-redstone-500', label: 'Cancelled' },
  };
  const { color, label } = config[status] || { color: 'bg-gray-500', label: status };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />
      <span className="flex-1 text-sm text-gray-600 dark:text-gray-300">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function QuickStatCard({
  title,
  value,
  change,
  isPositive,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={cn(
              'text-xs font-medium mt-1',
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-redstone-600 dark:text-redstone-400'
            )}>
              {change}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function TimeCard({
  title,
  hours,
  subtitle,
  variant = 'default',
}: {
  title: string;
  hours: number;
  subtitle: string;
  variant?: 'default' | 'primary' | 'success';
}) {
  const variants = {
    default: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
    primary: 'bg-gradient-to-br from-redstone-600 to-redstone-700 text-white border border-transparent',
    success: 'bg-gradient-to-br from-green-600 to-green-700 text-white border border-transparent',
  };

  const isGradient = variant !== 'default';

  return (
    <div className={cn(
      'rounded-xl p-5 transition-all duration-200 hover:shadow-lg',
      variants[variant]
    )}>
      <p className={cn('text-sm font-medium', isGradient ? 'opacity-90' : 'text-gray-500 dark:text-gray-400')}>{title}</p>
      <p className="text-3xl font-bold mt-1">{hours}h</p>
      <p className={cn('text-xs mt-1', isGradient ? 'opacity-75' : 'text-gray-400')}>{subtitle}</p>
    </div>
  );
}
