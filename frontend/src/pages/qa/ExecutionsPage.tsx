import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PlayCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { testExecutionService } from '@/services/testExecution.service';
import { projectService } from '@/services/project.service';
import { ExecutionFilters, ExecutionStatus, TestExecution } from '@/types/qa.types';
import Avatar from '@/components/ui/Avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn, formatDate, formatDuration } from '@/utils/helpers';

const statusConfig: Record<ExecutionStatus, { icon: any; color: string; bg: string; label: string }> = {
  NOT_RUN: { icon: MinusCircleIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10', label: 'Not Run' },
  PASS: { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/10', label: 'Pass' },
  FAIL: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/10', label: 'Fail' },
  BLOCKED: { icon: MinusCircleIcon, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/10', label: 'Blocked' },
  SKIPPED: { icon: MinusCircleIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10', label: 'Skipped' },
};

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PASS', label: 'Pass' },
  { value: 'FAIL', label: 'Fail' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'SKIPPED', label: 'Skipped' },
];

export default function ExecutionsPage() {
  const [filters, setFilters] = useState<ExecutionFilters>({
    page: 1,
    limit: 20,
  });

  // Fetch executions
  const { data: executionsData, isLoading } = useQuery({
    queryKey: ['testExecutions', filters],
    queryFn: () => testExecutionService.getAll(filters),
  });

  const executions = executionsData?.data || [];
  const meta = executionsData?.meta;

  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });

  const projects = (projectsData as any)?.data || [];

  const handleFilterChange = (key: keyof ExecutionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate stats from current page
  const passCount = executions.filter((e: TestExecution) => e.status === 'PASS').length;
  const failCount = executions.filter((e: TestExecution) => e.status === 'FAIL').length;
  const blockedCount = executions.filter((e: TestExecution) => e.status === 'BLOCKED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PlayCircleIcon className="w-7 h-7 text-redstone-500" />
          Test Executions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View test execution history and results
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{meta?.total || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Executions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{passCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Passed (this page)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{failCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Failed (this page)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">{blockedCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Blocked (this page)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <FunnelIcon className="w-5 h-5 text-gray-400" />

              {/* Project Filter */}
              <select
                value={filters.projectId || ''}
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 text-sm"
              >
                <option value="">All Projects</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as ExecutionStatus)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 text-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executions List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Execution History</h2>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
            </div>
          ) : executions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PlayCircleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No Executions Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                No test executions match your filters. Try adjusting your search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {executions.map((execution: TestExecution) => {
                const status = statusConfig[execution.status];
                return (
                  <div
                    key={execution.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('p-2 rounded-lg', status.bg)}>
                          <status.icon className={cn('w-5 h-5', status.color)} />
                        </div>
                        <div>
                          <Link
                            to={`/qa/test-cases/${execution.testCaseId}`}
                            className="font-medium text-gray-900 dark:text-white hover:text-redstone-500"
                          >
                            {execution.testCase?.title || 'Unknown Test Case'}
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className={cn('font-medium', status.color)}>
                              {status.label}
                            </span>
                            <span>Run #{execution.runNumber}</span>
                            {execution.executedBy && (
                              <div className="flex items-center gap-1">
                                <Avatar
                                  firstName={execution.executedBy.firstName}
                                  lastName={execution.executedBy.lastName}
                                  avatar={execution.executedBy.avatar}
                                  size="xs"
                                />
                                <span>{execution.executedBy.firstName}</span>
                              </div>
                            )}
                            {execution.executionTime && (
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{formatDuration(execution.executionTime)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(execution.executedAt)}
                        </p>
                        {execution.notes && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs truncate">
                            {execution.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(meta.page - 1) * meta.limit + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
