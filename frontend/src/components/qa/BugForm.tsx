import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import {
  Bug,
  BugSeverity,
  BugStatus,
  CreateBugData,
  UpdateBugData,
  QAAttachment,
} from '@/types/qa.types';
import { projectService } from '@/services/project.service';
import { milestoneService } from '@/services/milestone.service';
import { taskService } from '@/services/task.service';
import { testCaseService } from '@/services/testCase.service';
import { userService } from '@/services/user.service';
import Button from '@/components/ui/Button';
import AttachmentUploader from './AttachmentUploader';
import AttachmentGallery from './AttachmentGallery';

interface BugFormProps {
  bug?: Bug;
  testCaseId?: string;
  taskId?: string;
  projectId?: string;
  onSubmit: (data: CreateBugData | UpdateBugData, pendingFiles?: File[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const severityOptions: { value: BugSeverity; label: string; color: string }[] = [
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
  { value: 'LOW', label: 'Low', color: 'text-green-600' },
];

const statusOptions: { value: BugStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'FIXED', label: 'Fixed' },
  { value: 'RETEST', label: 'Retest' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
];

export default function BugForm({
  bug,
  testCaseId: initialTestCaseId,
  taskId: initialTaskId,
  projectId: initialProjectId,
  onSubmit,
  onCancel,
  isSubmitting,
}: BugFormProps) {
  const isEditing = !!bug;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM' as BugSeverity,
    status: 'OPEN' as BugStatus,
    stepsToReproduce: '',
    environment: '',
    actualResult: '',
    expectedResult: '',
    projectId: initialProjectId || '',
    milestoneId: '',
    taskId: initialTaskId || '',
    testCaseId: initialTestCaseId || '',
    assignedToId: '',
    resolution: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<QAAttachment[]>(bug?.attachments || []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAll(),
  });

  const projects = (projectsData as any)?.data || [];

  // Fetch milestones when project changes
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', formData.projectId],
    queryFn: () => milestoneService.getByProject(formData.projectId),
    enabled: !!formData.projectId,
  });

  // Fetch tasks when project changes
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', formData.projectId],
    queryFn: () => taskService.getByProject(formData.projectId),
    enabled: !!formData.projectId,
  });

  // Fetch test cases when project changes
  const { data: testCasesData } = useQuery({
    queryKey: ['testCases', formData.projectId],
    queryFn: () => testCaseService.getAll({ projectId: formData.projectId, limit: 100 }),
    enabled: !!formData.projectId,
  });

  const testCases = testCasesData?.data || [];

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const users = (usersData as any)?.data || usersData || [];

  // Initialize form with bug data when editing
  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        status: bug.status,
        stepsToReproduce: bug.stepsToReproduce || '',
        environment: bug.environment || '',
        actualResult: bug.actualResult || '',
        expectedResult: bug.expectedResult || '',
        projectId: bug.projectId,
        milestoneId: bug.milestoneId || '',
        taskId: bug.taskId,
        testCaseId: bug.testCaseId || '',
        assignedToId: bug.assignedToId || '',
        resolution: bug.resolution || '',
      });
    }
  }, [bug]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Reset dependent fields when project changes
    if (field === 'projectId') {
      setFormData((prev) => ({
        ...prev,
        milestoneId: '',
        taskId: '',
        testCaseId: '',
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.taskId) {
      newErrors.taskId = 'Task is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = isEditing
      ? {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          status: formData.status,
          stepsToReproduce: formData.stepsToReproduce || undefined,
          environment: formData.environment || undefined,
          actualResult: formData.actualResult || undefined,
          expectedResult: formData.expectedResult || undefined,
          assignedToId: formData.assignedToId || undefined,
          resolution: formData.resolution || undefined,
        }
      : {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          stepsToReproduce: formData.stepsToReproduce || undefined,
          environment: formData.environment || undefined,
          actualResult: formData.actualResult || undefined,
          expectedResult: formData.expectedResult || undefined,
          projectId: formData.projectId,
          milestoneId: formData.milestoneId || undefined,
          taskId: formData.taskId,
          testCaseId: formData.testCaseId || undefined,
          assignedToId: formData.assignedToId || undefined,
        };

    onSubmit(data, pendingFiles.length > 0 ? pendingFiles : undefined);
  };

  // Handle file selection for new bugs (before bug is created)
  const handlePendingFiles = (files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter bug title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the bug in detail..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.projectId}
            onChange={(e) => handleChange('projectId', e.target.value)}
            disabled={isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 disabled:opacity-50"
          >
            <option value="">Select Project</option>
            {projects.map((project: any) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>}
        </div>

        {/* Milestone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Milestone
          </label>
          <select
            value={formData.milestoneId}
            onChange={(e) => handleChange('milestoneId', e.target.value)}
            disabled={!formData.projectId || isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 disabled:opacity-50"
          >
            <option value="">Select Milestone (Optional)</option>
            {(milestones as any[]).map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.title}
              </option>
            ))}
          </select>
        </div>

        {/* Task */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.taskId}
            onChange={(e) => handleChange('taskId', e.target.value)}
            disabled={!formData.projectId || isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 disabled:opacity-50"
          >
            <option value="">Select Task</option>
            {(tasks as any[]).map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          {errors.taskId && <p className="text-red-500 text-sm mt-1">{errors.taskId}</p>}
        </div>

        {/* Linked Test Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Linked Test Case
          </label>
          <select
            value={formData.testCaseId}
            onChange={(e) => handleChange('testCaseId', e.target.value)}
            disabled={!formData.projectId || isEditing}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 disabled:opacity-50"
          >
            <option value="">Select Test Case (Optional)</option>
            {testCases.map((tc: any) => (
              <option key={tc.id} value={tc.id}>
                {tc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Severity
          </label>
          <select
            value={formData.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          >
            {severityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status (only for editing) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Assign To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assign To
          </label>
          <select
            value={formData.assignedToId}
            onChange={(e) => handleChange('assignedToId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          >
            <option value="">Unassigned</option>
            {(Array.isArray(users) ? users : []).map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Steps to Reproduce */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Steps to Reproduce
          </label>
          <textarea
            value={formData.stepsToReproduce}
            onChange={(e) => handleChange('stepsToReproduce', e.target.value)}
            placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
        </div>

        {/* Environment */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Environment
          </label>
          <input
            type="text"
            value={formData.environment}
            onChange={(e) => handleChange('environment', e.target.value)}
            placeholder="e.g., Chrome 120, macOS Sonoma, iPhone 15 Pro"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          />
        </div>

        {/* Expected Result */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected Result
          </label>
          <textarea
            value={formData.expectedResult}
            onChange={(e) => handleChange('expectedResult', e.target.value)}
            placeholder="What should happen..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
        </div>

        {/* Actual Result */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Actual Result
          </label>
          <textarea
            value={formData.actualResult}
            onChange={(e) => handleChange('actualResult', e.target.value)}
            placeholder="What actually happened..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
        </div>

        {/* Resolution (only for editing) */}
        {isEditing && (formData.status === 'FIXED' || formData.status === 'CLOSED') && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution
            </label>
            <textarea
              value={formData.resolution}
              onChange={(e) => handleChange('resolution', e.target.value)}
              placeholder="How was this bug resolved..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
            />
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <PaperClipIcon className="w-4 h-4" />
            Attachments
            {(attachments.length > 0 || pendingFiles.length > 0) && (
              <span className="text-xs text-gray-500">
                ({isEditing ? attachments.length : pendingFiles.length})
              </span>
            )}
          </label>
          <button
            type="button"
            onClick={() => setShowAttachmentUploader(!showAttachmentUploader)}
            className="text-sm text-redstone-500 hover:text-redstone-600 transition-colors"
          >
            {showAttachmentUploader ? 'Hide uploader' : '+ Add attachment'}
          </button>
        </div>

        {/* For editing existing bugs - direct upload */}
        {isEditing && bug && showAttachmentUploader && (
          <AttachmentUploader
            context={{ bugId: bug.id }}
            onUploadComplete={(newAttachments) => {
              setAttachments((prev) => [...prev, ...newAttachments]);
              queryClient.invalidateQueries({ queryKey: ['bug', bug.id] });
              setShowAttachmentUploader(false);
            }}
            maxFiles={5}
            maxFileSize={10}
          />
        )}

        {/* For creating new bugs - file picker */}
        {!isEditing && showAttachmentUploader && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-redstone-500 transition-colors"
              onClick={() => document.getElementById('pending-file-input')?.click()}
            >
              <input
                id="pending-file-input"
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files) {
                    handlePendingFiles(Array.from(e.target.files));
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
              <PaperClipIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-redstone-500">Click to select</span> screenshots, videos, or documents
              </p>
              <p className="text-xs text-gray-500 mt-1">Max 10MB per file</p>
            </div>
          </div>
        )}

        {/* Show pending files for new bugs */}
        {!isEditing && pendingFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files to upload ({pendingFiles.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {pendingFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-2"
                >
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : file.type.startsWith('video/') ? (
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-600">VID</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500">DOC</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These files will be uploaded after the bug is created.
            </p>
          </div>
        )}

        {/* Show existing attachments for editing */}
        {isEditing && attachments.length > 0 && (
          <AttachmentGallery
            attachments={attachments}
            viewMode="grid"
            editable
            onDelete={(attachment) => {
              setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
            }}
          />
        )}

        {/* Empty state */}
        {((isEditing && attachments.length === 0) || (!isEditing && pendingFiles.length === 0)) &&
         !showAttachmentUploader && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            No attachments yet. Click "+ Add attachment" to upload screenshots or files.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEditing ? 'Update Bug' : 'Report Bug'}
        </Button>
      </div>
    </form>
  );
}
