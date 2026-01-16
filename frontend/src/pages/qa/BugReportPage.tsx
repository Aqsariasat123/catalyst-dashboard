import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BugAntIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { bugService } from '@/services/bug.service';
import { projectService } from '@/services/project.service';
import { exportToPDF, exportToExcel, formatBugReportData } from '@/utils/export';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';
import { BugSeverity, BugStatus } from '@/types/qa.types';

const severityColors: Record<BugSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

const statusColors: Record<BugStatus, string> = {
  OPEN: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
  FIXED: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  RETEST: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  CLOSED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  REOPENED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

export default function BugReportPage() {
  const [filters, setFilters] = useState({
    projectId: '',
    severity: '',
    status: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });
  const projects = projectsData?.data || [];

  // Fetch bugs
  const { data: bugsData, isLoading } = useQuery({
    queryKey: ['bugs', 'report', filters],
    queryFn: () =>
      bugService.getAll({
        projectId: filters.projectId || undefined,
        severity: filters.severity as BugSeverity || undefined,
        status: filters.status as BugStatus || undefined,
        limit: 500, // Get more for report
      }),
  });

  const bugs = bugsData?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const total = bugs.length;
    const open = bugs.filter((b: any) => b.status === 'OPEN' || b.status === 'REOPENED').length;
    const inProgress = bugs.filter((b: any) => b.status === 'IN_PROGRESS').length;
    const fixed = bugs.filter((b: any) => b.status === 'FIXED' || b.status === 'RETEST').length;
    const closed = bugs.filter((b: any) => b.status === 'CLOSED').length;
    const critical = bugs.filter((b: any) => b.severity === 'CRITICAL').length;
    const high = bugs.filter((b: any) => b.severity === 'HIGH').length;

    return { total, open, inProgress, fixed, closed, critical, high };
  }, [bugs]);

  // Filter labels for export
  const filterLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    if (filters.projectId) {
      const project = projects.find((p: any) => p.id === filters.projectId);
      labels['Project'] = project?.name || filters.projectId;
    }
    if (filters.severity) {
      labels['Severity'] = filters.severity;
    }
    if (filters.status) {
      labels['Status'] = filters.status;
    }
    return labels;
  }, [filters, projects]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = formatBugReportData(bugs, filterLabels, stats);
      await exportToPDF(reportData);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const reportData = formatBugReportData(bugs, filterLabels, stats);
      await exportToExcel(reportData);
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      projectId: '',
      severity: '',
      status: '',
    });
  };

  // Calculate age in days
  const getAge = (createdAt: string) => {
    const days = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
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
              <BugAntIcon className="w-7 h-7 text-red-500" />
              Bug Summary Report
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and export bug analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting || bugs.length === 0}
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="primary"
            onClick={handleExportExcel}
            disabled={isExporting || bugs.length === 0}
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
          {(filters.projectId || filters.severity || filters.status) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-redstone-500"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
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
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FIXED">Fixed</option>
                <option value="RETEST">Retest</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.fixed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fixed/Retest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bug List ({bugs.length})
          </h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
            </div>
          ) : bugs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No bugs found matching the filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Bug ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Severity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Assigned To
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Age
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.slice(0, 50).map((bug: any) => (
                    <tr
                      key={bug.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          BUG-{bug.bugNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {bug.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            severityColors[bug.severity as BugSeverity]
                          )}
                        >
                          {bug.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            statusColors[bug.status as BugStatus]
                          )}
                        >
                          {bug.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {bug.assignedTo
                          ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}`
                          : 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {getAge(bug.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bugs.length > 50 && (
                <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing 50 of {bugs.length} results. Export to see all data.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
