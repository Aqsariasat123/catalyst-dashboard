import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { Milestone, Task, TaskStatus, ActiveTimer, MilestoneStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Select from '@/components/ui/Select';
import { formatDate } from '@/utils/helpers';

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];

function getMilestoneStatusColor(status: MilestoneStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    case 'IN_PROGRESS':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400';
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getMilestoneStatusLabel(status: MilestoneStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not Started';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

function getProgressBarColor(status: MilestoneStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'bg-gray-400';
    case 'IN_PROGRESS':
      return 'bg-cyan-500';
    case 'COMPLETED':
      return 'bg-green-500';
    case 'CANCELLED':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
    case 'HIGH':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
    case 'LOW':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  activeTimer: ActiveTimer | null | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string, title: string) => void;
  isTimerLoading: boolean;
}

export default function MilestoneCard({
  milestone,
  index,
  activeTimer,
  onEdit,
  onDelete,
  onAddTask,
  onEditTask,
  onStartTimer,
  onStopTimer,
  onUpdateTaskStatus,
  onDeleteTask,
  isTimerLoading,
}: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const progress = milestone.progress ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-redstone-600 dark:border-redstone-500 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Milestone Header */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Milestone Number */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-redstone-100 dark:bg-redstone-500/20 flex items-center justify-center">
            <span className="text-lg font-bold text-redstone-600 dark:text-redstone-400">{index + 1}</span>
          </div>

          {/* Milestone Title and Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {milestone.title}
              </h3>
              <Badge className={getMilestoneStatusColor(milestone.status)} size="sm">
                {getMilestoneStatusLabel(milestone.status)}
              </Badge>
            </div>
            {milestone.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {milestone.description}
              </p>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-3">
            <button
              onClick={onAddTask}
              className="p-2 text-gray-500 hover:text-redstone-600 dark:hover:text-redstone-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Add Task"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit Milestone"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete Milestone"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">
                {milestone.completedTasks ?? 0} / {milestone.totalTasks ?? 0} tasks completed
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBarColor(milestone.status)} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {milestone.dueDate && (
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                {formatDate(milestone.dueDate)}
              </span>
            )}
            {(milestone.totalTimeSeconds ?? 0) > 0 && (
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                {formatDuration(milestone.totalTimeSeconds ?? 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      {isExpanded && milestone.tasks && milestone.tasks.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="p-4 space-y-3">
            {milestone.tasks.map((task) => (
              <MilestoneTaskCard
                key={task.id}
                task={task}
                activeTimer={activeTimer}
                onEdit={() => onEditTask(task)}
                onStartTimer={() => onStartTimer(task.id)}
                onStopTimer={onStopTimer}
                onUpdateStatus={(status) => onUpdateTaskStatus(task.id, status)}
                onDelete={() => onDeleteTask(task.id, task.title)}
                isTimerLoading={isTimerLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty Tasks State */}
      {isExpanded && (!milestone.tasks || milestone.tasks.length === 0) && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No tasks in this milestone yet.{' '}
            <button
              onClick={onAddTask}
              className="text-redstone-600 dark:text-redstone-400 hover:underline"
            >
              Add a task
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

interface MilestoneTaskCardProps {
  task: Task;
  activeTimer: ActiveTimer | null | undefined;
  onEdit: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onDelete: () => void;
  isTimerLoading: boolean;
}

function MilestoneTaskCard({
  task,
  activeTimer,
  onEdit,
  onStartTimer,
  onStopTimer,
  onUpdateStatus,
  onDelete,
  isTimerLoading,
}: MilestoneTaskCardProps) {
  const isTimerActive = activeTimer?.taskId === task.id;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex flex-col gap-3">
        {/* Task Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h4>
              <Badge className={getPriorityColor(task.priority)} size="sm">
                {task.priority}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Assignee Avatar */}
          {task.assignee && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Avatar
                firstName={task.assignee.firstName}
                lastName={task.assignee.lastName}
                avatar={task.assignee.avatar}
                size="sm"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {task.assignee.firstName}
              </span>
            </div>
          )}
        </div>

        {/* Task Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              Due: {formatDate(task.dueDate)}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {task.estimatedHours}h estimated
            </span>
          )}
          {(task.totalTimeSeconds ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <ClockIcon className="w-3.5 h-3.5" />
              {formatDuration(task.totalTimeSeconds ?? 0)} tracked
            </span>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* Status Dropdown */}
          <Select
            options={statusOptions}
            value={task.status}
            onChange={(e) => onUpdateStatus(e.target.value as TaskStatus)}
            className="w-36 text-sm"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Timer button */}
            <button
              onClick={isTimerActive ? onStopTimer : onStartTimer}
              disabled={isTimerLoading || (!!activeTimer && !isTimerActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isTimerActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30'
              }`}
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

            {/* Edit button */}
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
              title="Edit Task"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Task"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
