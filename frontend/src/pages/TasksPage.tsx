import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PlayIcon,
  StopIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { taskService, TaskFilters, CreateTaskData } from '@/services/task.service';
import { timeEntryService } from '@/services/timeEntry.service';
import { projectService } from '@/services/project.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/stores/authStore';
import { Task, TaskStatus, TaskPriority, ActiveTimer } from '@/types';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import {
  cn,
  formatDate,
  formatDuration,
} from '@/utils/helpers';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const priorityOptionsForForm = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const statusOptionsForForm = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const initialTaskForm = {
  title: '',
  description: '',
  projectId: '',
  assigneeId: '',
  priority: 'MEDIUM' as TaskPriority,
  status: 'TODO' as TaskStatus,
  estimatedHours: '',
  dueDate: '',
};

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 20,
    status: undefined,
    priority: undefined,
    search: '',
  });

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(initialTaskForm);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getAll(filters),
  });

  const { data: activeTimer } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: () => timeEntryService.getActiveTimer(),
  });

  const { data: projects } = useQuery({
    queryKey: ['projectsSimple'],
    queryFn: () => projectService.getAllSimple(),
    enabled: showNewTaskModal,
  });

  const { data: developers } = useQuery({
    queryKey: ['developers'],
    queryFn: () => userService.getDevelopers(),
    enabled: showNewTaskModal,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['developerDashboard'] });
      setShowNewTaskModal(false);
      setTaskForm(initialTaskForm);
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create task');
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeEntryService.startTimer(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Timer started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start timer');
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: () => timeEntryService.stopTimer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Timer stopped!');
    },
    onError: () => {
      toast.error('Failed to stop timer');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated!');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const handleCreateTask = () => {
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!taskForm.projectId) {
      toast.error('Please select a project');
      return;
    }
    createTaskMutation.mutate({
      title: taskForm.title,
      description: taskForm.description || undefined,
      projectId: taskForm.projectId,
      assigneeId: taskForm.assigneeId || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      estimatedHours: taskForm.estimatedHours ? parseFloat(taskForm.estimatedHours) : undefined,
      dueDate: taskForm.dueDate || undefined,
    });
  };

  // Calculate stats
  const totalTasks = data?.meta.total || 0;
  const inProgressTasks = data?.data.filter(t => t.status === 'IN_PROGRESS').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'Tasks' : 'My Tasks'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalTasks} total · {inProgressTasks} in progress
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
              onClick={() => setShowNewTaskModal(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: (e.target.value as TaskStatus) || undefined, page: 1 })}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: (e.target.value as TaskPriority) || undefined, page: 1 })}
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Project</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Due / Time</div>
          <div className="col-span-2 text-right">Actions</div>
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
            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              No tasks found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filters.search ? 'Try adjusting your search' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data?.data.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                activeTimer={activeTimer}
                onStartTimer={() => startTimerMutation.mutate(task.id)}
                onStopTimer={() => stopTimerMutation.mutate()}
                onStatusChange={(status) => updateStatusMutation.mutate({ id: task.id, status })}
                isTimerLoading={startTimerMutation.isPending || stopTimerMutation.isPending}
              />
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

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowNewTaskModal(false)}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-redstone-600 dark:text-redstone-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      New Task
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNewTaskModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Task Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Task Title <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Design homepage mockup"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Project <span className="text-redstone-500">*</span>
                  </label>
                  <select
                    value={taskForm.projectId}
                    onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                  >
                    <option value="">Select project...</option>
                    {projects?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Assignee
                  </label>
                  <select
                    value={taskForm.assigneeId}
                    onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {developers?.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.firstName} {dev.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority & Status Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      {priorityOptionsForForm.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      {statusOptionsForForm.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hours & Due Date Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief task description..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setTaskForm(initialTaskForm);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createTaskMutation.isPending ? (
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
                      Create Task
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

interface TaskRowProps {
  task: Task;
  activeTimer: ActiveTimer | null | undefined;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onStatusChange: (status: TaskStatus) => void;
  isTimerLoading: boolean;
}

function TaskRow({
  task,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onStatusChange,
  isTimerLoading,
}: TaskRowProps) {
  const isTimerActive = activeTimer?.taskId === task.id;
  const hasOtherActiveTimer = !!activeTimer && !isTimerActive;

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    TODO: { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' },
    IN_PROGRESS: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
    IN_REVIEW: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
    COMPLETED: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    BLOCKED: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  };

  const priorityConfig: Record<string, { bg: string; text: string }> = {
    LOW: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
    MEDIUM: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400' },
    HIGH: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400' },
    URGENT: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' },
  };

  const status = statusConfig[task.status] || statusConfig.TODO;
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  return (
    <div className={cn(
      "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
      isTimerActive && "bg-redstone-50/50 dark:bg-redstone-500/5"
    )}>
      {/* Desktop Row */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
        {/* Task Info */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isTimerActive
              ? "bg-redstone-100 dark:bg-redstone-500/10"
              : "bg-gray-100 dark:bg-gray-700"
          )}>
            {isTimerActive ? (
              <div className="w-3 h-3 bg-redstone-500 rounded-full animate-pulse" />
            ) : (
              <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </h3>
            {task.assignee && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Avatar
                  firstName={task.assignee.firstName}
                  lastName={task.assignee.lastName}
                  avatar={task.assignee.avatar}
                  size="xs"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {task.assignee.firstName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Project */}
        <div className="col-span-2 min-w-0">
          {task.project ? (
            <Link
              to={`/projects/${task.project.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-redstone-600 dark:hover:text-redstone-400 transition-colors"
            >
              <FolderIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{task.project.name}</span>
            </Link>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        {/* Priority */}
        <div className="col-span-1">
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap',
            priority.bg, priority.text
          )}>
            {task.priority}
          </span>
        </div>

        {/* Status */}
        <div className="col-span-1">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
            className={cn(
              'text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600',
              status.bg, status.text
            )}
          >
            {statusOptions.slice(1).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due / Time */}
        <div className="col-span-2">
          <div className="space-y-1">
            {task.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            {task.totalTimeSeconds !== undefined && task.totalTimeSeconds > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{formatDuration(task.totalTimeSeconds)}</span>
              </div>
            )}
            {!task.dueDate && (!task.totalTimeSeconds || task.totalTimeSeconds === 0) && (
              <span className="text-sm text-gray-400">—</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          {task.status !== 'COMPLETED' && (
            <button
              onClick={isTimerActive ? onStopTimer : onStartTimer}
              disabled={isTimerLoading || hasOtherActiveTimer}
              title={isTimerActive ? 'Stop timer' : hasOtherActiveTimer ? 'Stop other timer first' : 'Start timer'}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                isTimerActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30'
              )}
            >
              {isTimerActive ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Start</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Card */}
      <div className="md:hidden px-4 py-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isTimerActive
              ? "bg-redstone-100 dark:bg-redstone-500/10"
              : "bg-gray-100 dark:bg-gray-700"
          )}>
            {isTimerActive ? (
              <div className="w-3 h-3 bg-redstone-500 rounded-full animate-pulse" />
            ) : (
              <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {task.title}
              </h3>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 whitespace-nowrap',
                status.bg, status.text
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {task.status === 'IN_PROGRESS' ? 'Active' : task.status.replace('_', ' ')}
              </span>
            </div>
            {task.project && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {task.project.name}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className={cn('px-1.5 py-0.5 rounded', priority.bg, priority.text)}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              {task.assignee && (
                <span className="flex items-center gap-1">
                  <Avatar
                    firstName={task.assignee.firstName}
                    lastName={task.assignee.lastName}
                    avatar={task.assignee.avatar}
                    size="xs"
                  />
                </span>
              )}
            </div>
          </div>
          {task.status !== 'COMPLETED' && (
            <button
              onClick={isTimerActive ? onStopTimer : onStartTimer}
              disabled={isTimerLoading || hasOtherActiveTimer}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50',
                isTimerActive
                  ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              )}
            >
              {isTimerActive ? (
                <>
                  <StopIcon className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-3.5 h-3.5" />
                  <span>Start</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
