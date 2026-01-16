import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TestCase,
  TestStep,
  TestCasePriority,
  TestCaseType,
  TestCaseStatus,
  CreateTestCaseData,
  UpdateTestCaseData,
} from '@/types/qa.types';
import { projectService } from '@/services/project.service';
import { milestoneService } from '@/services/milestone.service';
import { taskService } from '@/services/task.service';
import TestStepsEditor from './TestStepsEditor';
import Button from '@/components/ui/Button';

interface TestCaseFormProps {
  testCase?: TestCase;
  onSubmit: (data: CreateTestCaseData | UpdateTestCaseData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const priorityOptions: { value: TestCasePriority; label: string }[] = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const typeOptions: { value: TestCaseType; label: string }[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATION', label: 'Automation' },
];

const statusOptions: { value: TestCaseStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DEPRECATED', label: 'Deprecated' },
];

export default function TestCaseForm({ testCase, onSubmit, onCancel, isSubmitting }: TestCaseFormProps) {
  const isEditing = !!testCase;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectedResult: '',
    preconditions: '',
    priority: 'MEDIUM' as TestCasePriority,
    type: 'MANUAL' as TestCaseType,
    status: 'ACTIVE' as TestCaseStatus,
    projectId: '',
    milestoneId: '',
    taskId: '',
    steps: [] as TestStep[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Initialize form with testCase data when editing
  useEffect(() => {
    if (testCase) {
      setFormData({
        title: testCase.title,
        description: testCase.description || '',
        expectedResult: testCase.expectedResult,
        preconditions: testCase.preconditions || '',
        priority: testCase.priority,
        type: testCase.type,
        status: testCase.status,
        projectId: testCase.projectId,
        milestoneId: testCase.milestoneId || '',
        taskId: testCase.taskId,
        steps: testCase.steps || [],
      });
    }
  }, [testCase]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Reset milestone and task when project changes
    if (field === 'projectId') {
      setFormData((prev) => ({ ...prev, milestoneId: '', taskId: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.expectedResult.trim()) {
      newErrors.expectedResult = 'Expected result is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.taskId) {
      newErrors.taskId = 'Task is required';
    }
    if (formData.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    } else {
      const hasEmptyStep = formData.steps.some((s) => !s.step.trim());
      if (hasEmptyStep) {
        newErrors.steps = 'All steps must have a description';
      }
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
          description: formData.description || undefined,
          expectedResult: formData.expectedResult,
          preconditions: formData.preconditions || undefined,
          priority: formData.priority,
          type: formData.type,
          status: formData.status,
          steps: formData.steps,
        }
      : {
          title: formData.title,
          description: formData.description || undefined,
          expectedResult: formData.expectedResult,
          preconditions: formData.preconditions || undefined,
          priority: formData.priority,
          type: formData.type,
          status: formData.status,
          projectId: formData.projectId,
          milestoneId: formData.milestoneId || undefined,
          taskId: formData.taskId,
          steps: formData.steps,
        };

    onSubmit(data);
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
            placeholder="Enter test case title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter test case description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
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

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
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

        {/* Preconditions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preconditions
          </label>
          <textarea
            value={formData.preconditions}
            onChange={(e) => handleChange('preconditions', e.target.value)}
            placeholder="Enter any preconditions or setup required..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
        </div>

        {/* Expected Result */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected Result <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.expectedResult}
            onChange={(e) => handleChange('expectedResult', e.target.value)}
            placeholder="Enter the overall expected result..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
          />
          {errors.expectedResult && <p className="text-red-500 text-sm mt-1">{errors.expectedResult}</p>}
        </div>
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Test Steps <span className="text-red-500">*</span>
        </label>
        <TestStepsEditor
          steps={formData.steps}
          onChange={(steps) => setFormData((prev) => ({ ...prev, steps }))}
        />
        {errors.steps && <p className="text-red-500 text-sm mt-1">{errors.steps}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {isEditing ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </div>
    </form>
  );
}
