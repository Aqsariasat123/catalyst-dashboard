import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BugAntIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { ProjectQAStats } from '@/types/qa.types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/utils/helpers';

interface ProjectHealthListProps {
  projects: ProjectQAStats[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const statusConfig: Record<
  string,
  { icon: any; color: string; bg: string; progressColor: string }
> = {
  READY: {
    icon: CheckCircleIcon,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-500/10',
    progressColor: 'bg-green-500',
  },
  AT_RISK: {
    icon: ExclamationTriangleIcon,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    progressColor: 'bg-amber-500',
  },
  NOT_READY: {
    icon: XCircleIcon,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-500/10',
    progressColor: 'bg-red-500',
  },
};

export default function ProjectHealthList({
  projects,
  title = 'Project QA Health',
  maxItems = 5,
  className,
}: ProjectHealthListProps) {
  const displayProjects = projects.slice(0, maxItems);

  if (projects.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BeakerIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No projects with QA data</p>
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
          {projects.length > maxItems && (
            <Link
              to="/projects"
              className="text-sm text-redstone-500 hover:text-redstone-600 transition-colors"
            >
              View all
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayProjects.map((project) => {
            const config = statusConfig[project.status] || statusConfig.NOT_READY;
            const StatusIcon = config.icon;

            return (
              <div key={project.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-redstone-500 truncate"
                      >
                        {project.name}
                      </Link>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          config.bg,
                          config.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {project.client.name}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.passRate.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={cn('h-full rounded-full transition-all', config.progressColor)}
                    style={{ width: `${project.passRate}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <BeakerIcon className="w-3.5 h-3.5" />
                    {project.testCases} tests
                  </span>
                  {project.openBugs > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <BugAntIcon className="w-3.5 h-3.5" />
                      {project.openBugs} open
                    </span>
                  )}
                  {project.criticalBugs > 0 && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      {project.criticalBugs} critical
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
