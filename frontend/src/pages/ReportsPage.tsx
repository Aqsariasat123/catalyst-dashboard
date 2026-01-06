import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { dashboardService } from '@/services/dashboard.service';
import { projectService } from '@/services/project.service';
import { clientService } from '@/services/client.service';
import { DashboardStats } from '@/types';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';

type ReportType = 'overview' | 'time' | 'projects' | 'team' | 'billing';
type DateRange = '7d' | '30d' | '90d' | 'year' | 'all';

const reportTabs = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'time', label: 'Time Tracking', icon: ClockIcon },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'team', label: 'Team Performance', icon: UserGroupIcon },
  { id: 'billing', label: 'Billing', icon: CurrencyDollarIcon },
];

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const { data: dashboardStats } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: dashboardService.getAdminDashboard,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', { limit: 100 }],
    queryFn: () => projectService.getAll({ limit: 100 }),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientService.getAll({ limit: 100 }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="w-40"
          />
          <Button variant="outline">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportType)}
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

      {/* Report Content */}
      {activeTab === 'overview' && <OverviewReport stats={dashboardStats} />}
      {activeTab === 'time' && <TimeReport stats={dashboardStats} />}
      {activeTab === 'projects' && <ProjectsReport projects={projects?.data} stats={dashboardStats} />}
      {activeTab === 'team' && <TeamReport stats={dashboardStats} />}
      {activeTab === 'billing' && <BillingReport stats={dashboardStats} clients={clients?.data} />}
    </div>
  );
}

function OverviewReport({ stats }: { stats?: DashboardStats }) {
  if (!stats) return <ReportSkeleton />;

  const totalTasks = Object.values(stats.tasksByStatus).reduce((a, b) => a + b, 0);
  const completedTasks = stats.tasksByStatus.COMPLETED || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderIcon}
          color="redstone"
        />
        <SummaryCard
          title="Total Tasks"
          value={totalTasks}
          icon={ChartBarIcon}
          color="blue"
        />
        <SummaryCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={ArrowTrendingUpIcon}
          color="emerald"
        />
        <SummaryCard
          title="Hours Tracked"
          value={`${stats.totalTrackedHours}h`}
          icon={ClockIcon}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.tasksByStatus).map(([status, count]) => {
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      {status.replace('_', ' ')}
                    </div>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getStatusColor(status))}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                      <span className="text-xs text-gray-400 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.projectsByStatus).map(([status, count]) => {
                const total = Object.values(stats.projectsByStatus).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      {status.replace('_', ' ')}
                    </div>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getProjectStatusColor(status))}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                      <span className="text-xs text-gray-400 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricItem label="Avg. Tasks/Project" value={(totalTasks / Math.max(stats.totalProjects, 1)).toFixed(1)} />
            <MetricItem label="Active Developers" value={stats.totalDevelopers} />
            <MetricItem label="Total Clients" value={stats.totalClients} />
            <MetricItem label="Avg. Hours/Task" value={`${(stats.totalTrackedHours / Math.max(totalTasks, 1)).toFixed(1)}h`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimeReport({ stats }: { stats?: DashboardStats }) {
  if (!stats) return <ReportSkeleton />;

  // Mock weekly data for demonstration
  const weeklyData = [
    { day: 'Mon', hours: 8 },
    { day: 'Tue', hours: 7.5 },
    { day: 'Wed', hours: 9 },
    { day: 'Thu', hours: 6 },
    { day: 'Fri', hours: 8.5 },
    { day: 'Sat', hours: 2 },
    { day: 'Sun', hours: 0 },
  ];

  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="space-y-6">
      {/* Time Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Today" value="0h" icon={ClockIcon} color="redstone" />
        <SummaryCard title="This Week" value="41h" icon={CalendarDaysIcon} color="blue" />
        <SummaryCard title="This Month" value="168h" icon={CalendarDaysIcon} color="emerald" />
        <SummaryCard title="Total" value={`${stats.totalTrackedHours}h`} icon={ClockIcon} color="amber" />
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative" style={{ height: '160px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-redstone-600 to-redstone-400 rounded-t-lg transition-all"
                    style={{ height: `${maxHours > 0 ? (day.hours / maxHours) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{day.hours}h</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time by Project */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time by Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'E-commerce Platform', hours: 45, percentage: 35 },
              { name: 'Mobile App Development', hours: 32, percentage: 25 },
              { name: 'Website Redesign', hours: 28, percentage: 22 },
              { name: 'API Integration', hours: 23, percentage: 18 },
            ].map((project) => (
              <div key={project.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{project.name}</span>
                    <span className="text-gray-500">{project.hours}h</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-redstone-500 rounded-full"
                      style={{ width: `${project.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsReport({ projects, stats }: { projects?: any[]; stats?: DashboardStats }) {
  if (!stats) return <ReportSkeleton />;

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Projects" value={stats.totalProjects} icon={FolderIcon} color="redstone" />
        <SummaryCard title="Active" value={stats.projectsByStatus.IN_PROGRESS || 0} icon={ArrowTrendingUpIcon} color="blue" />
        <SummaryCard title="Completed" value={stats.projectsByStatus.COMPLETED || 0} icon={ChartBarIcon} color="emerald" />
        <SummaryCard title="On Hold" value={stats.projectsByStatus.ON_HOLD || 0} icon={CalendarDaysIcon} color="amber" />
      </div>

      {/* Project Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Tasks</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Hours</th>
                </tr>
              </thead>
              <tbody>
                {projects?.slice(0, 10).map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-xs font-medium',
                        getProjectStatusBadge(project.status)
                      )}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {project._count?.tasks || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-redstone-500 rounded-full" style={{ width: '65%' }} />
                        </div>
                        <span className="text-xs text-gray-500">65%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">0h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamReport({ stats }: { stats?: DashboardStats }) {
  if (!stats) return <ReportSkeleton />;

  // Mock team data
  const teamData = [
    { name: 'John Doe', role: 'Developer', tasks: 12, completed: 8, hours: 45 },
    { name: 'Jane Smith', role: 'Designer', tasks: 8, completed: 6, hours: 38 },
    { name: 'Mike Johnson', role: 'Developer', tasks: 15, completed: 12, hours: 52 },
    { name: 'Sarah Wilson', role: 'QC', tasks: 10, completed: 9, hours: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Team Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Team Size" value={stats.totalDevelopers} icon={UserGroupIcon} color="redstone" />
        <SummaryCard title="Avg. Tasks/Person" value={(Object.values(stats.tasksByStatus).reduce((a, b) => a + b, 0) / Math.max(stats.totalDevelopers, 1)).toFixed(1)} icon={ChartBarIcon} color="blue" />
        <SummaryCard title="Avg. Hours/Person" value={`${(stats.totalTrackedHours / Math.max(stats.totalDevelopers, 1)).toFixed(0)}h`} icon={ClockIcon} color="emerald" />
        <SummaryCard title="Completion Rate" value="85%" icon={ArrowTrendingUpIcon} color="amber" />
      </div>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Member</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Tasks</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Completed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Performance</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((member, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.role}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.tasks}</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">{member.completed}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.hours}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round((member.completed / member.tasks) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((member.completed / member.tasks) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingReport({ stats, clients }: { stats?: DashboardStats; clients?: any[] }) {
  if (!stats) return <ReportSkeleton />;

  const avgHourlyRate = 75; // Mock average rate
  const estimatedRevenue = stats.totalTrackedHours * avgHourlyRate;

  return (
    <div className="space-y-6">
      {/* Billing Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Billable Hours" value={`${stats.totalTrackedHours}h`} icon={ClockIcon} color="redstone" />
        <SummaryCard title="Avg. Rate" value={`$${avgHourlyRate}`} icon={CurrencyDollarIcon} color="blue" />
        <SummaryCard title="Est. Revenue" value={`$${estimatedRevenue.toLocaleString()}`} icon={CurrencyDollarIcon} color="emerald" />
        <SummaryCard title="Active Clients" value={stats.totalClients} icon={BuildingOffice2Icon} color="amber" />
      </div>

      {/* Client Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients?.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
                    <span className="text-gray-500">${Math.floor(Math.random() * 10000).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'redstone' | 'blue' | 'emerald' | 'amber';
}) {
  const colors = {
    redstone: 'bg-redstone-50 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400',
    blue: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: 'bg-gray-400',
    IN_PROGRESS: 'bg-cyan-500',
    IN_REVIEW: 'bg-purple-500',
    COMPLETED: 'bg-emerald-500',
    BLOCKED: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-400';
}

function getProjectStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLANNING: 'bg-amber-500',
    IN_PROGRESS: 'bg-cyan-500',
    ON_HOLD: 'bg-orange-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-400';
}

function getProjectStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    PLANNING: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    IN_PROGRESS: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    ON_HOLD: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
}
