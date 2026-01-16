import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { projectService } from '@/services/project.service';
import { TestCaseFilters as Filters, TestCaseStatus, TestCasePriority, TestCaseType } from '@/types/qa.types';

interface TestCaseFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DEPRECATED', label: 'Deprecated' },
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATION', label: 'Automation' },
];

export default function TestCaseFiltersComponent({ filters, onChange }: TestCaseFiltersProps) {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });

  const projects = (projectsData as any)?.data || [];

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onChange({
      ...filters,
      [key]: value || undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = filters.projectId || filters.status || filters.priority || filters.type || filters.search;

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-gray-400 hidden lg:block" />

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
            onChange={(e) => handleFilterChange('status', e.target.value as TestCaseStatus)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value as TestCasePriority)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 text-sm"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value as TestCaseType)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 text-sm"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
