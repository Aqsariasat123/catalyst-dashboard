import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ClockIcon,
  FolderIcon,
  PlayIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { taskService } from '@/services/task.service';
import { timeEntryService } from '@/services/timeEntry.service';
import { useAuthStore } from '@/stores/authStore';
import { TaskStatus } from '@/types';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn, formatDate, formatDuration } from '@/utils/helpers';

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];

function getActivityDescription(activity: any): string {
  const formatValue = (value: string | null | undefined, field?: string) => {
    if (!value) return 'none';
    if (field === 'status' || field === 'priority') {
      return value.replace(/_/g, ' ').toLowerCase();
    }
    return value;
  };

  switch (activity.action) {
    case 'CREATED':
      return 'created this task';
    case 'STATUS_CHANGED':
      return `changed status from "${formatValue(activity.oldValue, 'status')}" to "${formatValue(activity.newValue, 'status')}"`;
    case 'ASSIGNEE_CHANGED':
      return activity.newValue
        ? `assigned this task to a new user`
        : `unassigned this task`;
    case 'PRIORITY_CHANGED':
      return `changed priority from "${formatValue(activity.oldValue, 'priority')}" to "${formatValue(activity.newValue, 'priority')}"`;
    case 'TIMER_STARTED':
      return 'started tracking time';
    case 'TIMER_STOPPED':
      const duration = activity.metadata?.duration;
      if (duration) {
        const mins = Math.floor(Number(duration) / 60);
        const secs = Number(duration) % 60;
        return `stopped timer (${mins}m ${secs}s logged)`;
      }
      return 'stopped tracking time';
    case 'DUE_DATE_CHANGED':
      return `changed due date`;
    case 'TITLE_CHANGED':
      return `changed title`;
    case 'DESCRIPTION_CHANGED':
      return `updated description`;
    case 'MILESTONE_CHANGED':
      return `changed milestone`;
    case 'REVIEW_STATUS_CHANGED':
      return `changed review status to "${formatValue(activity.newValue)}"`;
    default:
      return `made changes`;
  }
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getById(id!),
    enabled: !!id,
  });

  const { data: activeTimers } = useQuery({
    queryKey: ['activeTimers'],
    queryFn: () => timeEntryService.getActiveTimers(),
  });

  const isTimerActive = activeTimers?.some(timer => timer.taskId === id);

  const startTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeEntryService.startTimer(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimers'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success('Timer started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start timer');
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeEntryService.stopTimerByTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimers'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast.success('Timer stopped!');
    },
    onError: () => {
      toast.error('Failed to stop timer');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: TaskStatus) => taskService.update(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Status updated!');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => taskService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
      navigate('/tasks');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete task');
    },
  });

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    TODO: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' },
    IN_PROGRESS: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
    IN_REVIEW: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    BLOCKED: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  };

  const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
    LOW: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', label: 'Low' },
    MEDIUM: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', label: 'Medium' },
    HIGH: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', label: 'High' },
    URGENT: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', label: 'Urgent' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-16">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Task not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The task you're looking for doesn't exist or you don't have access.</p>
        <Button onClick={() => navigate('/tasks')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  const status = statusConfig[task.status] || statusConfig.TODO;
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h1>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                status.bg, status.text
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {task.status.replace('_', ' ')}
              </span>
            </div>
            {task.project && (
              <Link
                to={`/projects/${task.project.id}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-redstone-600 dark:hover:text-redstone-400 flex items-center gap-1.5 mt-1"
              >
                <FolderIcon className="w-4 h-4" />
                {task.project.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.status !== 'COMPLETED' && (
            <Button
              variant={isTimerActive ? 'outline' : 'primary'}
              onClick={() => isTimerActive ? stopTimerMutation.mutate(id!) : startTimerMutation.mutate(id!)}
              disabled={startTimerMutation.isPending || stopTimerMutation.isPending}
              className={isTimerActive ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
            >
              {isTimerActive ? (
                <>
                  <StopIcon className="w-4 h-4 mr-2" />
                  Stop Timer
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Start Timer
                </>
              )}
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/tasks?edit=${task.id}`)}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/10"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
                Description
              </h2>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Task Activity */}
          {(task as any).activities && (task as any).activities.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                  Task Activity
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(task as any).activities.slice(0, 10).map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      {activity.user && (
                        <Avatar
                          firstName={activity.user.firstName}
                          lastName={activity.user.lastName}
                          avatar={activity.user.avatar}
                          size="sm"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">
                            {activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'Unknown'}
                          </span>
                          {' '}
                          {getActivityDescription(activity)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Task Info */}
        <div className="space-y-6">
          {/* Task Info Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Info</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => updateStatusMutation.mutate(e.target.value as TaskStatus)}
                    disabled={updateStatusMutation.isPending}
                    className={cn(
                      'mt-1 w-full text-sm font-medium rounded-lg px-3 py-2 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600',
                      status.bg, status.text
                    )}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <span className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium w-fit',
                    priority.bg, priority.text
                  )}>
                    <FlagIcon className="w-4 h-4" />
                    {priority.label}
                  </span>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assignee
                  </label>
                  {task.assignee ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar
                        firstName={task.assignee.firstName}
                        lastName={task.assignee.lastName}
                        avatar={task.assignee.avatar}
                        size="sm"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Unassigned</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </label>
                  {task.dueDate ? (
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {formatDate(task.dueDate)}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">No due date</p>
                  )}
                </div>

                {/* Estimated Hours */}
                {task.estimatedHours && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estimated Hours
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {task.estimatedHours} hours
                    </p>
                  </div>
                )}

                {/* Time Tracked */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time Tracked
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    {formatDuration(task.totalTimeSeconds || 0)}
                  </div>
                </div>

                {/* Review Status */}
                {task.reviewStatus && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Review Status
                    </label>
                    <div className={cn(
                      'mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                      task.reviewStatus === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      task.reviewStatus === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                      task.reviewStatus === 'NEEDS_CHANGES' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400'
                    )}>
                      <CheckCircleIcon className="w-4 h-4" />
                      {task.reviewStatus.replace('_', ' ')}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          {task.project && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FolderIcon className="w-5 h-5 text-gray-500" />
                  Project
                </h2>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/projects/${task.project.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{task.project.name}</p>
                  {task.project.client && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {task.project.client.name}
                    </p>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Delete Task
                  </h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{task.title}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTaskMutation.mutate()}
                  disabled={deleteTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteTaskMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      Delete
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
