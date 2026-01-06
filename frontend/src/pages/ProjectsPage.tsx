import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  XMarkIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { projectService, ProjectFilters, CreateProjectData } from '@/services/project.service';
import { clientService } from '@/services/client.service';
import { useAuthStore } from '@/stores/authStore';
import { Project, ProjectStatus } from '@/types';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { formatDate, cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusOptionsForForm = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

const initialProjectForm = {
  name: '',
  description: '',
  clientId: '',
  status: 'PLANNING' as ProjectStatus,
  startDate: '',
  endDate: '',
  budget: '',
  currency: 'USD',
};

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 20,
    status: undefined,
    search: '',
  });

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState(initialProjectForm);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getAll(filters),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll({ limit: 100 }),
    enabled: showNewProjectModal,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectData) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setShowNewProjectModal(false);
      setProjectForm(initialProjectForm);
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create project');
    },
  });

  const handleCreateProject = () => {
    if (!projectForm.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!projectForm.clientId) {
      toast.error('Please select a client');
      return;
    }
    createProjectMutation.mutate({
      name: projectForm.name,
      description: projectForm.description || undefined,
      clientId: projectForm.clientId,
      status: projectForm.status,
      startDate: projectForm.startDate || undefined,
      endDate: projectForm.endDate || undefined,
      budget: projectForm.budget ? parseFloat(projectForm.budget) : undefined,
      currency: projectForm.currency,
    });
  };

  // Calculate stats
  const totalProjects = data?.meta.total || 0;
  const activeProjects = data?.data.filter(p => p.status === 'IN_PROGRESS').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalProjects} total · {activeProjects} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Live</span>
          </div>
          {isAdmin && (
            <Button
              className="bg-redstone-600 hover:bg-redstone-700"
              onClick={() => setShowNewProjectModal(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as ProjectStatus) || undefined, page: 1 })}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Project</div>
          <div className="col-span-2">Client</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Timeline</div>
          <div className="col-span-2">Team</div>
          <div className="col-span-1 text-right">Tasks</div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FolderIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              No projects found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filters.search ? 'Try adjusting your search' : 'Create your first project to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data?.data.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, data.meta.total)} of {data.meta.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === data.meta.totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowNewProjectModal(false)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                      <FolderIcon className="w-4 h-4 text-redstone-600 dark:text-redstone-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      New Project
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNewProjectModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Project Name <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Website Redesign"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Client */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Client <span className="text-redstone-500">*</span>
                  </label>
                  <select
                    value={projectForm.clientId}
                    onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                  >
                    <option value="">Select client...</option>
                    {clients?.data.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status & Dates Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as ProjectStatus })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      {statusOptionsForForm.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Start
                    </label>
                    <input
                      type="date"
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      End
                    </label>
                    <input
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                </div>

                {/* Budget Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Budget
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={projectForm.budget}
                      onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Currency
                    </label>
                    <select
                      value={projectForm.currency}
                      onChange={(e) => setProjectForm({ ...projectForm, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="PKR">PKR</option>
                      <option value="AUD">AUD</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief project description..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setProjectForm(initialProjectForm);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    PLANNING: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    IN_PROGRESS: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
    ON_HOLD: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
    COMPLETED: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    CANCELLED: { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' },
  };

  const status = statusConfig[project.status] || statusConfig.PLANNING;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      {/* Desktop Row */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
        {/* Project Info */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center flex-shrink-0">
            <FolderIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Client */}
        <div className="col-span-2 min-w-0">
          {project.client ? (
            <div className="flex items-center gap-2">
              <BuildingOffice2Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {project.client.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        {/* Status */}
        <div className="col-span-1">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
            status.bg, status.text
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', status.dot)} />
            {project.status === 'IN_PROGRESS' ? 'Active' : project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Timeline */}
        <div className="col-span-2">
          {project.startDate ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{formatDate(project.startDate)}</span>
              {project.endDate && (
                <>
                  <span>→</span>
                  <span>{formatDate(project.endDate)}</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        {/* Team */}
        <div className="col-span-2">
          {project.members && project.members.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {project.members.slice(0, 3).map((member) =>
                  member.user ? (
                    <Avatar
                      key={member.id}
                      firstName={member.user.firstName}
                      lastName={member.user.lastName}
                      avatar={member.user.avatar}
                      size="xs"
                      className="ring-2 ring-white dark:ring-gray-800"
                    />
                  ) : null
                )}
              </div>
              {project.members.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{project.members.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        {/* Tasks Count */}
        <div className="col-span-1 text-right">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400" title="Completed">
                {(project as any).taskCounts?.completed || 0}
              </span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-cyan-600 dark:text-cyan-400" title="In Progress">
                {(project as any).taskCounts?.inProgress || 0}
              </span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-gray-500 dark:text-gray-400" title="To Do">
                {(project as any).taskCounts?.todo || 0}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">done/active/todo</span>
          </div>
        </div>
      </div>

      {/* Mobile Card */}
      <div className="md:hidden px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center flex-shrink-0">
            <FolderIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {project.name}
              </h3>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap',
                status.bg, status.text
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {project.status === 'IN_PROGRESS' ? 'Active' : project.status.replace('_', ' ')}
              </span>
            </div>
            {project.client && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {project.client.name}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
                <span className="text-green-500">{(project as any).taskCounts?.completed || 0}</span>
                <span>/</span>
                <span className="text-cyan-500">{(project as any).taskCounts?.inProgress || 0}</span>
                <span>/</span>
                <span>{(project as any).taskCounts?.todo || 0}</span>
              </span>
              {project.members && project.members.length > 0 && (
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-3.5 h-3.5" />
                  {project.members.length}
                </span>
              )}
            </div>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}
