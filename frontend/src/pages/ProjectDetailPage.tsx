import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  StopIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { projectService } from '@/services/project.service';
import { taskService, CreateTaskData, UpdateTaskData } from '@/services/task.service';
import { milestoneService, CreateMilestoneData, UpdateMilestoneData } from '@/services/milestone.service';
import { timeEntryService } from '@/services/timeEntry.service';
import { userService } from '@/services/user.service';
import { Task, TaskStatus, TaskPriority, ActiveTimer, Milestone, MilestoneStatus } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Select from '@/components/ui/Select';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import MilestoneCard from '@/components/MilestoneCard';
import { formatDate, getStatusColor, getPriorityColor } from '@/utils/helpers';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const milestoneStatusOptions = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const initialTaskForm = {
  title: '',
  description: '',
  milestoneId: '',
  assigneeId: '',
  priority: 'MEDIUM' as TaskPriority,
  status: 'TODO' as TaskStatus,
  estimatedHours: '',
  dueDate: '',
};

const initialMilestoneForm = {
  title: '',
  description: '',
  status: 'NOT_STARTED' as MilestoneStatus,
  dueDate: '',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState(initialMilestoneForm);
  const [deleteMilestoneConfirm, setDeleteMilestoneConfirm] = useState<{ id: string; title: string } | null>(null);
  const [targetMilestoneId, setTargetMilestoneId] = useState<string | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id!),
    enabled: !!id,
  });

  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['projectMilestones', id],
    queryFn: () => milestoneService.getByProject(id!),
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['projectTasks', id],
    queryFn: () => taskService.getByProject(id!),
    enabled: !!id,
  });

  const { data: activeTimer } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: () => timeEntryService.getActiveTimer(),
  });

  const { data: developers } = useQuery({
    queryKey: ['developers'],
    queryFn: () => userService.getDevelopers(),
  });

  // Milestone mutations
  const createMilestoneMutation = useMutation({
    mutationFn: (data: CreateMilestoneData) => milestoneService.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      setShowMilestoneModal(false);
      setMilestoneForm(initialMilestoneForm);
      toast.success('Milestone created successfully');
    },
    onError: () => {
      toast.error('Failed to create milestone');
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, data }: { milestoneId: string; data: UpdateMilestoneData }) =>
      milestoneService.update(milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      setEditMilestone(null);
      setMilestoneForm(initialMilestoneForm);
      toast.success('Milestone updated successfully');
    },
    onError: () => {
      toast.error('Failed to update milestone');
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => milestoneService.delete(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      setDeleteMilestoneConfirm(null);
      toast.success('Milestone deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete milestone';
      toast.error(message);
    },
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['developerDashboard'] });
      setShowNewTaskModal(false);
      setTaskForm(initialTaskForm);
      setTargetMilestoneId(null);
      toast.success('Task created successfully');
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.update(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      toast.success('Task updated');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const fullUpdateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskData }) =>
      taskService.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditTask(null);
      setTaskForm(initialTaskForm);
      toast.success('Task updated successfully');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setDeleteTaskConfirm(null);
      toast.success('Task deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  // Timer mutations
  const startTimerMutation = useMutation({
    mutationFn: (taskId: string) => timeEntryService.startTimer(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      toast.success('Timer started');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to start timer';
      toast.error(message);
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: () => timeEntryService.stopTimer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectMilestones', id] });
      toast.success('Timer stopped');
    },
    onError: () => {
      toast.error('Failed to stop timer');
    },
  });

  // Handlers
  const handleCreateTask = () => {
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    createTaskMutation.mutate({
      title: taskForm.title,
      description: taskForm.description || undefined,
      projectId: id!,
      milestoneId: taskForm.milestoneId || targetMilestoneId || undefined,
      assigneeId: taskForm.assigneeId || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      estimatedHours: taskForm.estimatedHours ? parseFloat(taskForm.estimatedHours) : undefined,
      dueDate: taskForm.dueDate || undefined,
    });
  };

  const handleCreateMilestone = () => {
    if (!milestoneForm.title.trim()) {
      toast.error('Milestone title is required');
      return;
    }
    createMilestoneMutation.mutate({
      title: milestoneForm.title,
      description: milestoneForm.description || undefined,
      status: milestoneForm.status,
      dueDate: milestoneForm.dueDate || undefined,
    });
  };

  const handleUpdateMilestone = () => {
    if (!editMilestone || !milestoneForm.title.trim()) {
      toast.error('Milestone title is required');
      return;
    }
    updateMilestoneMutation.mutate({
      milestoneId: editMilestone.id,
      data: {
        title: milestoneForm.title,
        description: milestoneForm.description || undefined,
        status: milestoneForm.status,
        dueDate: milestoneForm.dueDate || undefined,
      },
    });
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditMilestone(milestone);
    setMilestoneForm({
      title: milestone.title,
      description: milestone.description || '',
      status: milestone.status,
      dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
    });
  };

  const handleAddTaskToMilestone = (milestoneId: string) => {
    setTargetMilestoneId(milestoneId);
    setTaskForm({ ...initialTaskForm, milestoneId });
    setShowNewTaskModal(true);
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setDeleteTaskConfirm({ id: taskId, title: taskTitle });
  };

  const confirmDeleteTask = () => {
    if (deleteTaskConfirm) {
      deleteTaskMutation.mutate(deleteTaskConfirm.id);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      milestoneId: task.milestoneId || '',
      assigneeId: task.assigneeId || '',
      priority: task.priority,
      status: task.status,
      estimatedHours: task.estimatedHours?.toString() || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  const handleUpdateTask = () => {
    if (!editTask || !taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    fullUpdateTaskMutation.mutate({
      taskId: editTask.id,
      data: {
        title: taskForm.title,
        description: taskForm.description || undefined,
        milestoneId: taskForm.milestoneId || null,
        assigneeId: taskForm.assigneeId || undefined,
        priority: taskForm.priority,
        status: taskForm.status,
        estimatedHours: taskForm.estimatedHours ? parseFloat(taskForm.estimatedHours) : undefined,
        dueDate: taskForm.dueDate || undefined,
      },
    });
  };

  // Get unassigned tasks (tasks without milestoneId)
  const unassignedTasks = tasks?.filter((task) => !task.milestoneId) || [];
  const filteredUnassignedTasks = unassignedTasks.filter(
    (task) => !statusFilter || task.status === statusFilter
  );

  // Group unassigned tasks by status
  const tasksByStatus = {
    TODO: filteredUnassignedTasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: filteredUnassignedTasks.filter((t) => t.status === 'IN_PROGRESS'),
    IN_REVIEW: filteredUnassignedTasks.filter((t) => t.status === 'IN_REVIEW'),
    COMPLETED: filteredUnassignedTasks.filter((t) => t.status === 'COMPLETED'),
    BLOCKED: filteredUnassignedTasks.filter((t) => t.status === 'BLOCKED'),
  };

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Project not found
        </h2>
        <Link to="/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Project Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              {project.client && (
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Client: {project.client.name}
                </p>
              )}
              {project.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {project.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.startDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Started: {formatDate(project.startDate)}</span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Due: {formatDate(project.endDate)}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>
                      Budget: {project.currency} {project.budget.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  <span>{project._count?.tasks || tasks?.length || 0} tasks</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members ({project.members?.length || 0})
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {project.members && project.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {project.members.map((member) =>
                member.user ? (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <Avatar
                      firstName={member.user.firstName}
                      lastName={member.user.lastName}
                      avatar={member.user.avatar}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {member.role}
                      </p>
                      {member.user.email && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {member.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No team members assigned to this project
            </p>
          )}
        </CardContent>
      </Card>

      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <FlagIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Milestones ({milestones?.length || 0})
              </h2>
            </div>
            <Button onClick={() => setShowMilestoneModal(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {milestonesLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  activeTimer={activeTimer}
                  onEdit={() => handleEditMilestone(milestone)}
                  onDelete={() => setDeleteMilestoneConfirm({ id: milestone.id, title: milestone.title })}
                  onAddTask={() => handleAddTaskToMilestone(milestone.id)}
                  onEditTask={handleEditTask}
                  onStartTimer={(taskId) => startTimerMutation.mutate(taskId)}
                  onStopTimer={() => stopTimerMutation.mutate()}
                  onUpdateTaskStatus={(taskId, status) =>
                    updateTaskMutation.mutate({ taskId, status })
                  }
                  onDeleteTask={(taskId, title) => handleDeleteTask(taskId, title)}
                  isTimerLoading={startTimerMutation.isPending || stopTimerMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No milestones in this project yet. Create one to organize your tasks.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Unassigned Tasks ({filteredUnassignedTasks.length})
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
                className="w-40"
              />
              <Button
                className="whitespace-nowrap"
                onClick={() => {
                  setTargetMilestoneId(null);
                  setTaskForm(initialTaskForm);
                  setShowNewTaskModal(true);
                }}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredUnassignedTasks.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) =>
                statusTasks.length > 0 ? (
                  <div key={status}>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <Badge className={getStatusColor(status as TaskStatus)}>
                        {status.replace('_', ' ')}
                      </Badge>
                      <span>({statusTasks.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {statusTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          milestones={milestones || []}
                          activeTimer={activeTimer}
                          onStartTimer={() => startTimerMutation.mutate(task.id)}
                          onStopTimer={() => stopTimerMutation.mutate()}
                          onUpdateStatus={(status) =>
                            updateTaskMutation.mutate({ taskId: task.id, status })
                          }
                          onDelete={() => handleDeleteTask(task.id, task.title)}
                          isTimerLoading={
                            startTimerMutation.isPending || stopTimerMutation.isPending
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {statusFilter
                ? 'No tasks match the selected filter'
                : 'No unassigned tasks. All tasks are organized in milestones.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => {
                setShowNewTaskModal(false);
                setTargetMilestoneId(null);
              }}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
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
                    onClick={() => {
                      setShowNewTaskModal(false);
                      setTargetMilestoneId(null);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Task Title <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Milestone
                  </label>
                  <select
                    value={taskForm.milestoneId || targetMilestoneId || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, milestoneId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                  >
                    <option value="">No Milestone (Unassigned)</option>
                    {milestones?.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                </div>

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
                      {priorityOptions.map((opt) => (
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
                      {statusOptions.filter((s) => s.value !== '').map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

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
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowNewTaskModal(false);
                    setTaskForm(initialTaskForm);
                    setTargetMilestoneId(null);
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

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => {
                setEditTask(null);
                setTaskForm(initialTaskForm);
              }}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Edit Task
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditTask(null);
                      setTaskForm(initialTaskForm);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Task Title <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Milestone
                  </label>
                  <select
                    value={taskForm.milestoneId}
                    onChange={(e) => setTaskForm({ ...taskForm, milestoneId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                  >
                    <option value="">No Milestone (Unassigned)</option>
                    {milestones?.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                </div>

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
                      {priorityOptions.map((opt) => (
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
                      {statusOptions.filter((s) => s.value !== '').map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

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
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setEditTask(null);
                    setTaskForm(initialTaskForm);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  disabled={fullUpdateTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {fullUpdateTaskMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Milestone Modal */}
      {(showMilestoneModal || editMilestone) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => {
                setShowMilestoneModal(false);
                setEditMilestone(null);
                setMilestoneForm(initialMilestoneForm);
              }}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                      <FlagIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {editMilestone ? 'Edit Milestone' : 'New Milestone'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowMilestoneModal(false);
                      setEditMilestone(null);
                      setMilestoneForm(initialMilestoneForm);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Milestone Title <span className="text-redstone-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter milestone title"
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter milestone description"
                    value={milestoneForm.description}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={milestoneForm.status}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value as MilestoneStatus })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all cursor-pointer"
                    >
                      {milestoneStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowMilestoneModal(false);
                    setEditMilestone(null);
                    setMilestoneForm(initialMilestoneForm);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editMilestone ? handleUpdateMilestone : handleCreateMilestone}
                  disabled={createMilestoneMutation.isPending || updateMilestoneMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-redstone-600 hover:bg-redstone-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(createMilestoneMutation.isPending || updateMilestoneMutation.isPending) ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {editMilestone ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editMilestone ? 'Update Milestone' : (
                        <>
                          <PlusIcon className="w-4 h-4" />
                          Create Milestone
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {deleteTaskConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setDeleteTaskConfirm(null)}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Delete Task
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteTaskConfirm.title}"</span>?
                  All time entries associated with this task will also be deleted.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteTaskConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  disabled={deleteTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      Delete Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Milestone Confirmation Modal */}
      {deleteMilestoneConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setDeleteMilestoneConfirm(null)}
            />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Delete Milestone
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteMilestoneConfirm.title}"</span>?
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                  Note: You can only delete milestones that have no tasks assigned.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteMilestoneConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMilestoneMutation.mutate(deleteMilestoneConfirm.id)}
                  disabled={deleteMilestoneMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleteMilestoneMutation.isPending ? (
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
                      Delete Milestone
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

interface TaskCardProps {
  task: Task;
  milestones: Milestone[];
  activeTimer: ActiveTimer | null | undefined;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onDelete: () => void;
  isTimerLoading: boolean;
}

function TaskCard({
  task,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onUpdateStatus,
  onDelete,
  isTimerLoading,
}: TaskCardProps) {
  const isTimerActive = activeTimer?.taskId === task.id;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </h4>
            <Badge className={getPriorityColor(task.priority)} size="sm">
              {task.priority}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
            {task.estimatedHours && <span>{task.estimatedHours}h estimated</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <Avatar
                firstName={task.assignee.firstName}
                lastName={task.assignee.lastName}
                avatar={task.assignee.avatar}
                size="sm"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:inline">
                {task.assignee.firstName}
              </span>
            </div>
          )}

          <Select
            options={statusOptions.filter((s) => s.value !== '')}
            value={task.status}
            onChange={(e) => onUpdateStatus(e.target.value as TaskStatus)}
            className="w-32 text-sm"
          />

          <Button
            variant={isTimerActive ? 'primary' : 'outline'}
            size="sm"
            onClick={isTimerActive ? onStopTimer : onStartTimer}
            disabled={isTimerLoading || (!!activeTimer && !isTimerActive)}
            className="flex items-center gap-1"
          >
            {isTimerActive ? (
              <>
                <StopIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </Button>

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
  );
}
