import { Link } from 'react-router-dom';
import {
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline';
import { TestCase, ExecutionStatus } from '@/types/qa.types';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn, formatDate } from '@/utils/helpers';
import { useState } from 'react';

interface TestCaseCardProps {
  testCase: TestCase;
  onExecute: (testCase: TestCase) => void;
  onEdit?: (testCase: TestCase) => void;
  onDelete?: (testCase: TestCase) => void;
}

const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', label: 'Critical' },
  HIGH: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', label: 'High' },
  MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', label: 'Medium' },
  LOW: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', label: 'Low' },
};

const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
  MANUAL: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', label: 'Manual' },
  AUTOMATION: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', label: 'Automation' },
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400', label: 'Draft' },
  ACTIVE: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', label: 'Active' },
  DEPRECATED: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', label: 'Deprecated' },
};

const executionStatusConfig: Record<ExecutionStatus, { icon: any; color: string; label: string }> = {
  NOT_RUN: { icon: MinusCircleIcon, color: 'text-gray-400', label: 'Not Run' },
  PASS: { icon: CheckCircleIcon, color: 'text-green-500', label: 'Pass' },
  FAIL: { icon: XCircleIcon, color: 'text-red-500', label: 'Fail' },
  BLOCKED: { icon: MinusCircleIcon, color: 'text-orange-500', label: 'Blocked' },
  SKIPPED: { icon: MinusCircleIcon, color: 'text-gray-500', label: 'Skipped' },
};

export default function TestCaseCard({ testCase, onExecute, onEdit, onDelete }: TestCaseCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const priority = priorityConfig[testCase.priority] || priorityConfig.MEDIUM;
  const type = typeConfig[testCase.type] || typeConfig.MANUAL;
  const status = statusConfig[testCase.status] || statusConfig.ACTIVE;
  const lastExecution = testCase.lastExecution;
  const executionStatus = lastExecution
    ? executionStatusConfig[lastExecution.status]
    : executionStatusConfig.NOT_RUN;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priority.bg, priority.text)}>
                {priority.label}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', type.bg, type.text)}>
                {type.label}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', status.bg, status.text)}>
                {status.label}
              </span>
            </div>

            {/* Title */}
            <Link
              to={`/qa/test-cases/${testCase.id}`}
              className="text-base font-medium text-gray-900 dark:text-white hover:text-redstone-600 dark:hover:text-redstone-400 block truncate"
            >
              {testCase.title}
            </Link>

            {/* Project & Task */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {testCase.project && (
                <span className="truncate">{testCase.project.name}</span>
              )}
              {testCase.task && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">&gt;</span>
                  <span className="truncate">{testCase.task.title}</span>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <BeakerIcon className="w-4 h-4" />
                <span>{testCase.steps?.length || 0} steps</span>
              </div>
              {lastExecution && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Last run: {formatDate(lastExecution.executedAt)}</span>
                </div>
              )}
              {(testCase._count?.bugs || 0) > 0 && (
                <div className="flex items-center gap-1 text-red-500">
                  <BugAntIcon className="w-4 h-4" />
                  <span>{testCase._count?.bugs} bugs</span>
                </div>
              )}
            </div>

            {/* Last Execution Status */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <executionStatus.icon className={cn('w-5 h-5', executionStatus.color)} />
                <span className={cn('text-sm font-medium', executionStatus.color)}>
                  {executionStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onExecute(testCase)}
              disabled={testCase.status === 'DEPRECATED'}
            >
              <PlayIcon className="w-4 h-4 mr-1" />
              Execute
            </Button>

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
                    <Link
                      to={`/qa/test-cases/${testCase.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setShowMenu(false)}
                    >
                      <BeakerIcon className="w-4 h-4" />
                      View Details
                    </Link>
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(testCase);
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
                          onDelete(testCase);
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
