import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FunnelIcon,
  BugAntIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { Task, ReviewStatus } from '@/types';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn, formatDate, formatDuration } from '@/utils/helpers';

const reviewStatusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  PENDING: {
    bg: 'bg-gray-100 dark:bg-gray-500/10',
    text: 'text-gray-700 dark:text-gray-400',
    icon: ClockIcon,
    label: 'Pending'
  },
  APPROVED: {
    bg: 'bg-green-100 dark:bg-green-500/10',
    text: 'text-green-700 dark:text-green-400',
    icon: CheckCircleIcon,
    label: 'Approved'
  },
  REJECTED: {
    bg: 'bg-red-100 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    icon: XCircleIcon,
    label: 'Rejected'
  },
  NEEDS_CHANGES: {
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    icon: ExclamationTriangleIcon,
    label: 'Needs Changes'
  },
};

const taskStatusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  TODO: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', dot: 'bg-gray-500' },
  IN_PROGRESS: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  IN_REVIEW: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  BLOCKED: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export default function QADashboardPage() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalTask, setReviewModalTask] = useState<Task | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('APPROVED');
  const [reviewComment, setReviewComment] = useState('');
  const [hasBugs, setHasBugs] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasksForReview', selectedProjectId],
    queryFn: () => taskService.getTasksForReview(selectedProjectId || undefined),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: { reviewStatus: ReviewStatus; reviewComment?: string; hasBugs?: boolean } }) =>
      taskService.reviewTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasksForReview'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Review submitted successfully!');
      closeReviewModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  const openReviewModal = (task: Task) => {
    setReviewModalTask(task);
    setReviewStatus('APPROVED');
    setReviewComment('');
    setHasBugs(false);
  };

  const closeReviewModal = () => {
    setReviewModalTask(null);
    setReviewStatus('APPROVED');
    setReviewComment('');
    setHasBugs(false);
  };

  const handleSubmitReview = () => {
    if (!reviewModalTask) return;

    reviewMutation.mutate({
      taskId: reviewModalTask.id,
      data: {
        reviewStatus,
        reviewComment: reviewComment || undefined,
        hasBugs,
      },
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.project?.name?.toLowerCase().includes(query) ||
      task.assignee?.firstName?.toLowerCase().includes(query) ||
      task.assignee?.lastName?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: tasks.length,
    inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    withBugs: tasks.filter(t => t.hasBugs).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QA Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve completed tasks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
                <EyeIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inReview}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">In Review Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg">
                <BugAntIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withBugs}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">With Bugs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
              >
                <option value="">All Projects</option>
                {(projects as any)?.data?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks Pending Review</h2>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500 mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">No tasks pending review</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => {
                const taskStatus = taskStatusConfig[task.status] || taskStatusConfig.TODO;
                const reviewStatusInfo = task.reviewStatus ? reviewStatusConfig[task.reviewStatus] : null;

                return (
                  <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-base font-medium text-gray-900 dark:text-white hover:text-redstone-600 dark:hover:text-redstone-400 truncate"
                          >
                            {task.title}
                          </Link>
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                            taskStatus.bg, taskStatus.text
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', taskStatus.dot)} />
                            {task.status.replace('_', ' ')}
                          </span>
                          {task.hasBugs && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                              <BugAntIcon className="w-3 h-3" />
                              Bugs
                            </span>
                          )}
                          {reviewStatusInfo && (
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                              reviewStatusInfo.bg, reviewStatusInfo.text
                            )}>
                              <reviewStatusInfo.icon className="w-3 h-3" />
                              {reviewStatusInfo.label}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          {task.project && (
                            <span className="truncate">{task.project.name}</span>
                          )}
                          {task.assignee && (
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                firstName={task.assignee.firstName}
                                lastName={task.assignee.lastName}
                                avatar={task.assignee.avatar}
                                size="xs"
                              />
                              <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                            </div>
                          )}
                          {task.totalTimeSeconds !== undefined && task.totalTimeSeconds > 0 && (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {formatDuration(task.totalTimeSeconds)}
                            </div>
                          )}
                        </div>

                        {task.reviewComment && (
                          <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{task.reviewComment}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/tasks/${task.id}`}>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openReviewModal(task)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {reviewModalTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeReviewModal} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Review Task
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {reviewModalTask.title}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Review Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['APPROVED', 'NEEDS_CHANGES', 'REJECTED'] as ReviewStatus[]).map((status) => {
                      const config = reviewStatusConfig[status];
                      return (
                        <button
                          key={status}
                          onClick={() => setReviewStatus(status)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                            reviewStatus === status
                              ? 'border-redstone-500 bg-redstone-50 dark:bg-redstone-500/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <config.icon className={cn('w-5 h-5', config.text)} />
                          <span className={cn(
                            'text-sm font-medium',
                            reviewStatus === status ? 'text-redstone-600 dark:text-redstone-400' : 'text-gray-700 dark:text-gray-300'
                          )}>
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Has Bugs */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBugs}
                      onChange={(e) => setHasBugs(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-redstone-500 focus:ring-redstone-500"
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <BugAntIcon className="w-4 h-4 text-red-500" />
                      Mark as having bugs
                    </span>
                  </label>
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Comment {reviewStatus !== 'APPROVED' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder={
                      reviewStatus === 'APPROVED'
                        ? 'Optional feedback...'
                        : 'Please provide details about the required changes...'
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-end gap-2">
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isPending || (reviewStatus !== 'APPROVED' && !reviewComment.trim())}
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
