import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  BugAntIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { qaDashboardService } from '@/services/qaDashboard.service';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn, formatDate } from '@/utils/helpers';
import ExecutionTrendChart from '@/components/qa/dashboard/ExecutionTrendChart';
import BugSeverityChart from '@/components/qa/dashboard/BugSeverityChart';
import ProjectHealthList from '@/components/qa/dashboard/ProjectHealthList';
import CriticalBugsList from '@/components/qa/dashboard/CriticalBugsList';

const statusBadgeConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  READY: {
    bg: 'bg-green-100 dark:bg-green-500/10',
    text: 'text-green-700 dark:text-green-400',
    label: 'Ready for Release',
    icon: CheckCircleIcon,
  },
  AT_RISK: {
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    label: 'At Risk',
    icon: ExclamationTriangleIcon,
  },
  NOT_READY: {
    bg: 'bg-red-100 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    label: 'Not Ready',
    icon: XCircleIcon,
  },
};

const executionStatusConfig: Record<string, { icon: any; color: string }> = {
  PASS: { icon: CheckCircleIcon, color: 'text-green-500' },
  FAIL: { icon: XCircleIcon, color: 'text-red-500' },
  BLOCKED: { icon: ExclamationTriangleIcon, color: 'text-orange-500' },
  SKIPPED: { icon: ClockIcon, color: 'text-gray-500' },
  NOT_RUN: { icon: ClockIcon, color: 'text-gray-400' },
};

export default function QAOverviewPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['qaDashboard'],
    queryFn: () => qaDashboardService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
      </div>
    );
  }

  const statusBadge = statusBadgeConfig[dashboardData.overallStatus] || statusBadgeConfig.NOT_READY;
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-6">
      {/* Header with Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QA Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Overview of quality assurance metrics and activities
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
            statusBadge.bg,
            statusBadge.text
          )}
        >
          <StatusIcon className="w-5 h-5" />
          {statusBadge.label}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                  <BeakerIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.testCases.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Test Cases</p>
                </div>
              </div>
              <Link to="/qa/test-cases" className="text-redstone-500 hover:text-redstone-600">
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.executions.passRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pass Rate</p>
                </div>
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                +3.2%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.executions.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Executions</p>
                </div>
              </div>
              <Link to="/qa/executions" className="text-redstone-500 hover:text-redstone-600">
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg">
                  <BugAntIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.bugs.open}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open Bugs</p>
                  {dashboardData.bugs.criticalHighOpen > 0 && (
                    <p className="text-xs text-red-500 font-medium">
                      {dashboardData.bugs.criticalHighOpen} critical/high
                    </p>
                  )}
                </div>
              </div>
              <Link to="/qa/bugs" className="text-redstone-500 hover:text-redstone-600">
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExecutionTrendChart data={dashboardData.executions.trend || []} />
        <BugSeverityChart data={dashboardData.bugs.bySeverity} />
      </div>

      {/* Test Case and Bug Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Case Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Case Status
            </h2>
            <Link
              to="/qa/test-cases"
              className="text-sm text-redstone-500 hover:text-redstone-600 flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dashboardData.testCases.byStatus).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  DRAFT: 'bg-gray-500',
                  ACTIVE: 'bg-green-500',
                  DEPRECATED: 'bg-red-500',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {status.toLowerCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            statusColors[status] || 'bg-redstone-500'
                          )}
                          style={{
                            width: `${
                              dashboardData.testCases.total > 0
                                ? (count / dashboardData.testCases.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bug Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bug Status</h2>
            <Link
              to="/qa/bugs"
              className="text-sm text-redstone-500 hover:text-redstone-600 flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dashboardData.bugs.byStatus).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  OPEN: 'bg-red-500',
                  IN_PROGRESS: 'bg-cyan-500',
                  FIXED: 'bg-blue-500',
                  RETEST: 'bg-purple-500',
                  CLOSED: 'bg-green-500',
                  REOPENED: 'bg-orange-500',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {status.replace('_', ' ').toLowerCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            statusColors[status] || 'bg-gray-500'
                          )}
                          style={{
                            width: `${
                              dashboardData.bugs.total > 0
                                ? (count / dashboardData.bugs.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Bugs and Recent Executions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalBugsList bugs={dashboardData.bugs.recentBugs || []} />

        {/* Recent Executions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Executions
            </h2>
            <Link
              to="/qa/executions"
              className="text-sm text-redstone-500 hover:text-redstone-600 flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {dashboardData.executions.recentExecutions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No recent executions
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.executions.recentExecutions.slice(0, 5).map((execution) => {
                  const statusConfig =
                    executionStatusConfig[execution.status] || executionStatusConfig.NOT_RUN;
                  return (
                    <div
                      key={execution.id}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <statusConfig.icon className={cn('w-5 h-5', statusConfig.color)} />
                          <div>
                            <Link
                              to={`/qa/test-cases/${execution.testCaseId}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-redstone-500"
                            >
                              {execution.testCase?.title || 'Unknown Test Case'}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Run #{execution.runNumber} • {execution.executedBy?.firstName}{' '}
                              {execution.executedBy?.lastName}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(execution.executedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Health */}
      <ProjectHealthList projects={dashboardData.projectStats} />
    </div>
  );
}
