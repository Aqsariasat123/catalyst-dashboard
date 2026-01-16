import { BugActivity } from '@/types/qa.types';
import Avatar from '@/components/ui/Avatar';
import { formatDate } from '@/utils/helpers';
import {
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/helpers';

interface BugActivityTimelineProps {
  activities: BugActivity[];
  isLoading?: boolean;
}

const actionConfig: Record<string, { icon: any; color: string; label: string }> = {
  CREATED: { icon: CheckCircleIcon, color: 'text-green-500 bg-green-100 dark:bg-green-500/10', label: 'created this bug' },
  STATUS_CHANGED: { icon: ArrowPathIcon, color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/10', label: 'changed status' },
  ASSIGNED: { icon: UserPlusIcon, color: 'text-purple-500 bg-purple-100 dark:bg-purple-500/10', label: 'assigned' },
  UNASSIGNED: { icon: XCircleIcon, color: 'text-gray-500 bg-gray-100 dark:bg-gray-500/10', label: 'unassigned' },
  COMMENT: { icon: ChatBubbleLeftIcon, color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-500/10', label: 'commented' },
  UPDATED: { icon: PencilIcon, color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/10', label: 'updated' },
  RESOLVED: { icon: CheckCircleIcon, color: 'text-green-500 bg-green-100 dark:bg-green-500/10', label: 'resolved' },
  REOPENED: { icon: ArrowPathIcon, color: 'text-red-500 bg-red-100 dark:bg-red-500/10', label: 'reopened' },
};

export default function BugActivityTimeline({ activities, isLoading }: BugActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-redstone-500" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No activity yet
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => {
          const config = actionConfig[activity.action] || actionConfig.UPDATED;
          const isLast = index === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {/* Connecting line */}
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex space-x-3">
                  {/* Icon */}
                  <div>
                    <span
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-black',
                        config.color
                      )}
                    >
                      <config.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {activity.user && (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.user.firstName} {activity.user.lastName}
                          </span>
                        )}{' '}
                        {config.label}
                        {activity.field && activity.oldValue && activity.newValue && (
                          <>
                            {' '}
                            <span className="font-medium">{activity.field}</span> from{' '}
                            <span className="line-through text-gray-500">{activity.oldValue}</span> to{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{activity.newValue}</span>
                          </>
                        )}
                        {activity.newValue && !activity.oldValue && activity.action === 'ASSIGNED' && (
                          <>
                            {' '}to <span className="font-medium text-gray-900 dark:text-white">{activity.newValue}</span>
                          </>
                        )}
                      </p>

                      {/* Comment content */}
                      {activity.comment && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {activity.comment}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
