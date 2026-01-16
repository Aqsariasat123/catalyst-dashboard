import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  PaperClipIcon,
  LinkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Bug, BugStatus, BugSeverity, BugActivity } from '@/types/qa.types';
import { bugService } from '@/services/bug.service';
import { userService } from '@/services/user.service';
import BugActivityTimeline from './BugActivityTimeline';
import AttachmentGallery from './AttachmentGallery';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { cn, formatDate } from '@/utils/helpers';

interface BugDetailModalProps {
  bug: Bug;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const severityConfig: Record<BugSeverity, { bg: string; text: string }> = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' },
  HIGH: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400' },
  MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400' },
  LOW: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
};

const statusConfig: Record<BugStatus, { bg: string; text: string; dot: string }> = {
  OPEN: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  IN_PROGRESS: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  FIXED: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  RETEST: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  CLOSED: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  REOPENED: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

const statusTransitions: Record<BugStatus, BugStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['FIXED', 'OPEN'],
  FIXED: ['RETEST', 'IN_PROGRESS'],
  RETEST: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'CLOSED'],
};

export default function BugDetailModal({ bug: initialBug, onClose, onEdit, onDelete }: BugDetailModalProps) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  // Fetch full bug details including attachments
  const { data: bugData } = useQuery({
    queryKey: ['bug', initialBug.id],
    queryFn: () => bugService.getById(initialBug.id),
    initialData: initialBug,
    staleTime: 0, // Always fetch fresh data to get attachments
  });

  // Use fetched bug data or fall back to initial bug
  const bug = bugData || initialBug;

  // Activities come from the bug data (included in findById response)
  const activities = bug.activities || [];
  const activitiesLoading = false;

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const users = (usersData as any)?.data || usersData || [];

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: ({ status, comment }: { status: BugStatus; comment?: string }) =>
      bugService.updateStatus(bug.id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bugActivities', bug.id] });
      toast.success('Status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (assignedToId: string) => bugService.assign(bug.id, assignedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bugActivities', bug.id] });
      toast.success('Bug assigned successfully!');
      setShowAssignDropdown(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign bug');
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: (comment: string) => bugService.addComment(bug.id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugActivities', bug.id] });
      toast.success('Comment added!');
      setComment('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  const handleStatusChange = (newStatus: BugStatus) => {
    statusMutation.mutate({ status: newStatus });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };

  const severity = severityConfig[bug.severity];
  const status = statusConfig[bug.status];
  const availableTransitions = statusTransitions[bug.status] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  BUG-{bug.bugNumber}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', severity.bg, severity.text)}>
                  {bug.severity}
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                  status.bg, status.text
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                  {bug.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {bug.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <PencilIcon className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-600">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
              {/* Main Content */}
              <div className="lg:col-span-2 p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {bug.description}
                  </p>
                </div>

                {/* Steps to Reproduce */}
                {bug.stepsToReproduce && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Steps to Reproduce
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {bug.stepsToReproduce}
                    </p>
                  </div>
                )}

                {/* Expected vs Actual */}
                {(bug.expectedResult || bug.actualResult) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bug.expectedResult && (
                      <div className="p-4 bg-green-50 dark:bg-green-500/5 rounded-lg border border-green-200 dark:border-green-500/20">
                        <h3 className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                          Expected Result
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {bug.expectedResult}
                        </p>
                      </div>
                    )}
                    {bug.actualResult && (
                      <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20">
                        <h3 className="text-sm font-medium text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
                          Actual Result
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {bug.actualResult}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Environment */}
                {bug.environment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Environment
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {bug.environment}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {bug.attachments && bug.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <PaperClipIcon className="w-4 h-4" />
                      Attachments ({bug.attachments.length})
                    </h3>
                    <AttachmentGallery
                      attachments={bug.attachments}
                      viewMode="grid"
                      editable={false}
                    />
                  </div>
                )}

                {/* Resolution */}
                {bug.resolution && (
                  <div className="p-4 bg-green-50 dark:bg-green-500/5 rounded-lg border border-green-200 dark:border-green-500/20">
                    <h3 className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-2">
                      Resolution
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {bug.resolution}
                    </p>
                  </div>
                )}

                {/* Activity Timeline */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Activity
                  </h3>
                  <BugActivityTimeline activities={activities} isLoading={activitiesLoading} />

                  {/* Add Comment */}
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button
                      variant="primary"
                      onClick={handleAddComment}
                      disabled={!comment.trim() || commentMutation.isPending}
                      isLoading={commentMutation.isPending}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                {/* Status Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Status Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTransitions.map((newStatus) => (
                      <Button
                        key={newStatus}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(newStatus)}
                        disabled={statusMutation.isPending}
                      >
                        {newStatus.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Assigned To
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                      className="flex items-center gap-2 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {bug.assignedTo ? (
                        <>
                          <Avatar
                            firstName={bug.assignedTo.firstName}
                            lastName={bug.assignedTo.lastName}
                            avatar={bug.assignedTo.avatar}
                            size="sm"
                          />
                          <span className="text-gray-900 dark:text-white">
                            {bug.assignedTo.firstName} {bug.assignedTo.lastName}
                          </span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                        </>
                      )}
                    </button>

                    {showAssignDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowAssignDropdown(false)} />
                        <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 max-h-48 overflow-y-auto">
                          {(Array.isArray(users) ? users : []).map((user: any) => (
                            <button
                              key={user.id}
                              onClick={() => assignMutation.mutate(user.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Avatar
                                firstName={user.firstName}
                                lastName={user.lastName}
                                avatar={user.avatar}
                                size="xs"
                              />
                              <span className="text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Reported By
                  </h3>
                  {bug.reportedBy && (
                    <div className="flex items-center gap-2">
                      <Avatar
                        firstName={bug.reportedBy.firstName}
                        lastName={bug.reportedBy.lastName}
                        avatar={bug.reportedBy.avatar}
                        size="sm"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {bug.reportedBy.firstName} {bug.reportedBy.lastName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Links */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Links
                  </h3>
                  <div className="space-y-2">
                    {bug.project && (
                      <Link
                        to={`/projects/${bug.project.id}`}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-redstone-500"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {bug.project.name}
                      </Link>
                    )}
                    {bug.task && (
                      <Link
                        to={`/tasks/${bug.task.id}`}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-redstone-500"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {bug.task.title}
                      </Link>
                    )}
                    {bug.testCase && (
                      <Link
                        to={`/qa/test-cases/${bug.testCase.id}`}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-redstone-500"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {bug.testCase.title}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Dates
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span>Created: {formatDate(bug.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span>Updated: {formatDate(bug.updatedAt)}</span>
                    </div>
                    {bug.resolvedAt && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>Resolved: {formatDate(bug.resolvedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
