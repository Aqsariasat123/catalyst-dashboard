import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BugAntIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { Bug, BugSeverity, BugStatus } from '@/types/qa.types';
import { Card, CardContent } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { cn, formatDate } from '@/utils/helpers';

interface BugCardProps {
  bug: Bug;
  onView: (bug: Bug) => void;
  onEdit?: (bug: Bug) => void;
  onDelete?: (bug: Bug) => void;
  onStatusChange?: (bug: Bug) => void;
}

const severityConfig: Record<BugSeverity, { bg: string; text: string; label: string }> = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', label: 'Critical' },
  HIGH: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', label: 'High' },
  MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', label: 'Medium' },
  LOW: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', label: 'Low' },
};

const statusConfig: Record<BugStatus, { bg: string; text: string; dot: string; label: string }> = {
  OPEN: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Open' },
  IN_PROGRESS: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500', label: 'In Progress' },
  FIXED: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', label: 'Fixed' },
  RETEST: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Retest' },
  CLOSED: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', label: 'Closed' },
  REOPENED: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Reopened' },
};

export default function BugCard({ bug, onView, onEdit, onDelete, onStatusChange }: BugCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const severity = severityConfig[bug.severity];
  const status = statusConfig[bug.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header with Bug Number and Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                BUG-{bug.bugNumber}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', severity.bg, severity.text)}>
                {severity.label}
              </span>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
                status.bg, status.text
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
            </div>

            {/* Title */}
            <button
              onClick={() => onView(bug)}
              className="text-base font-medium text-gray-900 dark:text-white hover:text-redstone-600 dark:hover:text-redstone-400 text-left block"
            >
              {bug.title}
            </button>

            {/* Project & Task */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {bug.project && (
                <Link to={`/projects/${bug.project.id}`} className="hover:text-redstone-500 truncate">
                  {bug.project.name}
                </Link>
              )}
              {bug.milestone && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&gt;</span>
                  <span className="truncate">{bug.milestone.title}</span>
                </>
              )}
              {bug.task && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&gt;</span>
                  <Link to={`/tasks/${bug.task.id}`} className="hover:text-redstone-500 truncate">
                    {bug.task.title}
                  </Link>
                </>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              {/* Reported By */}
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">Reported by:</span>
                {bug.reportedBy ? (
                  <div className="flex items-center gap-1">
                    <Avatar
                      firstName={bug.reportedBy.firstName}
                      lastName={bug.reportedBy.lastName}
                      avatar={bug.reportedBy.avatar}
                      size="xs"
                    />
                    <span>{bug.reportedBy.firstName}</span>
                  </div>
                ) : (
                  <span>Unknown</span>
                )}
              </div>

              {/* Created Date */}
              <span>{formatDate(bug.createdAt)}</span>
            </div>

            {/* Assigned To */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm">
                <UserIcon className="w-4 h-4 text-gray-400" />
                {bug.assignedTo ? (
                  <div className="flex items-center gap-1">
                    <Avatar
                      firstName={bug.assignedTo.firstName}
                      lastName={bug.assignedTo.lastName}
                      avatar={bug.assignedTo.avatar}
                      size="xs"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {bug.assignedTo.firstName} {bug.assignedTo.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 italic">Unassigned</span>
                )}
              </div>

              {/* Attachments Count */}
              {bug.attachments && bug.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <PaperClipIcon className="w-4 h-4" />
                  <span>{bug.attachments.length}</span>
                </div>
              )}

              {/* Activities/Comments Count */}
              {bug.activities && bug.activities.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{bug.activities.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(bug)}>
              <EyeIcon className="w-4 h-4 mr-1" />
              View
            </Button>

            {onStatusChange && (
              <Button variant="primary" size="sm" onClick={() => onStatusChange(bug)}>
                Update Status
              </Button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button
                      onClick={() => {
                        onView(bug);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                    >
                      <BugAntIcon className="w-4 h-4" />
                      View Details
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(bug);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(bug);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
