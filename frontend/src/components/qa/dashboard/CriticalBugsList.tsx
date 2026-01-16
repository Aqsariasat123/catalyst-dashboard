import { Link } from 'react-router-dom';
import { BugAntIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Bug, BugSeverity } from '@/types/qa.types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { cn, formatDate } from '@/utils/helpers';

interface CriticalBugsListProps {
  bugs: Bug[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const severityConfig: Record<BugSeverity, { color: string; bg: string; dot: string }> = {
  CRITICAL: {
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-500/10',
    dot: 'bg-red-500',
  },
  HIGH: {
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-500/10',
    dot: 'bg-orange-500',
  },
  MEDIUM: {
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-500/10',
    dot: 'bg-yellow-500',
  },
  LOW: {
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-500/10',
    dot: 'bg-green-500',
  },
};

export default function CriticalBugsList({
  bugs,
  title = 'Critical & High Priority Bugs',
  maxItems = 5,
  className,
}: CriticalBugsListProps) {
  // Filter for critical and high severity bugs that are not closed
  const criticalBugs = bugs
    .filter(
      (bug) =>
        (bug.severity === 'CRITICAL' || bug.severity === 'HIGH') && bug.status !== 'CLOSED'
    )
    .slice(0, maxItems);

  if (criticalBugs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-green-100 dark:bg-green-500/10 rounded-full mb-3">
              <BugAntIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">No critical bugs!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All critical and high priority bugs have been resolved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <Link
            to="/qa/bugs?severity=CRITICAL,HIGH"
            className="text-sm text-redstone-500 hover:text-redstone-600 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {criticalBugs.map((bug) => {
            const config = severityConfig[bug.severity];
            return (
              <div
                key={bug.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', config.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/qa/bugs/${bug.id}/edit`}
                          className="font-medium text-gray-900 dark:text-white hover:text-redstone-500 line-clamp-1"
                        >
                          BUG-{bug.bugNumber}: {bug.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              config.bg,
                              config.color
                            )}
                          >
                            {bug.severity}
                          </span>
                          {bug.project && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {bug.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {bug.assignedTo && (
                        <Avatar
                          firstName={bug.assignedTo.firstName}
                          lastName={bug.assignedTo.lastName}
                          avatar={bug.assignedTo.avatar}
                          size="xs"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Reported {formatDate(bug.createdAt)}
                      {bug.reportedBy && ` by ${bug.reportedBy.firstName}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
