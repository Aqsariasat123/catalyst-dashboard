import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { testExecutionService } from '@/services/testExecution.service';
import { projectService } from '@/services/project.service';
import { exportToPDF, exportToExcel, formatExecutionReportData } from '@/utils/export';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';

type ExecutionStatus = 'NOT_RUN' | 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED';

const statusColors: Record<ExecutionStatus, string> = {
  NOT_RUN: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  PASS: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  FAIL: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  BLOCKED: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  SKIPPED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
};

export default function ExecutionReportPage() {
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });
  const projects = projectsData?.data || [];

  // Fetch executions
  const { data: executionsData, isLoading } = useQuery({
    queryKey: ['executions', 'report', filters],
    queryFn: () =>
      testExecutionService.getAll({
        projectId: filters.projectId || undefined,
        status: filters.status as ExecutionStatus || undefined,
        limit: 500, // Get more for report
      }),
  });

  const executions = executionsData?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = executions.length;
    const passed = executions.filter((e: any) => e.status === 'PASS').length;
    const failed = executions.filter((e: any) => e.status === 'FAIL').length;
    const blocked = executions.filter((e: any) => e.status === 'BLOCKED').length;
    const skipped = executions.filter((e: any) => e.status === 'SKIPPED').length;
    const notRun = executions.filter((e: any) => e.status === 'NOT_RUN').length;

    return { total, passed, failed, blocked, skipped, notRun };
  }, [executions]);

  // Filter labels for export
  const filterLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    if (filters.projectId) {
      const project = projects.find((p: any) => p.id === filters.projectId);
      labels['Project'] = project?.name || filters.projectId;
    }
    if (filters.status) {
      labels['Status'] = filters.status;
    }
    if (filters.startDate) {
      labels['From Date'] = filters.startDate;
    }
    if (filters.endDate) {
      labels['To Date'] = filters.endDate;
    }
    return labels;
  }, [filters, projects]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = formatExecutionReportData(executions, filterLabels, stats);
      await exportToPDF(reportData);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const reportData = formatExecutionReportData(executions, filterLabels, stats);
      await exportToExcel(reportData);
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      projectId: '',
      status: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/qa/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-7 h-7 text-green-500" />
              Test Execution Report
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and export test execution results
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting || executions.length === 0}
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="primary"
            onClick={handleExportExcel}
            disabled={isExporting || executions.length === 0}
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filters
          </h2>
          {(filters.projectId || filters.status || filters.startDate || filters.endDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select
                value={filters.projectId}
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-redstone-500"
              >
                <option value="">All Projects</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-redstone-500"
              >
                <option value="">All Statuses</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="BLOCKED">Blocked</option>
                <option value="SKIPPED">Skipped</option>
                <option value="NOT_RUN">Not Run</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-redstone-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-redstone-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.blocked}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.skipped}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Skipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Execution Results ({executions.length})
          </h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No executions found matching the filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Test Case
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Executed By
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Executed At
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {executions.slice(0, 50).map((execution: any) => (
                    <tr
                      key={execution.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {execution.testCase?.title || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            statusColors[execution.status as ExecutionStatus]
                          )}
                        >
                          {execution.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {execution.executedBy
                          ? `${execution.executedBy.firstName} ${execution.executedBy.lastName}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {execution.executedAt
                          ? new Date(execution.executedAt).toLocaleString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {execution.executionTime ? `${execution.executionTime}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {executions.length > 50 && (
                <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing 50 of {executions.length} results. Export to see all data.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
