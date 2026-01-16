import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  BeakerIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { testCaseService } from '@/services/testCase.service';
import { testExecutionService } from '@/services/testExecution.service';
import { ExecuteTestData, ExecutionStatus, TestExecution } from '@/types/qa.types';
import TestStepsEditor from '@/components/qa/TestStepsEditor';
import ExecutionModal from '@/components/qa/ExecutionModal';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn, formatDate, formatDuration } from '@/utils/helpers';

const priorityConfig: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' },
  HIGH: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400' },
  MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400' },
  LOW: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
};

const typeConfig: Record<string, { bg: string; text: string }> = {
  MANUAL: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400' },
  AUTOMATION: { bg: 'bg-cyan-100 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400' },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400' },
  ACTIVE: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400' },
  DEPRECATED: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400' },
};

const executionStatusConfig: Record<ExecutionStatus, { icon: any; color: string; bg: string }> = {
  NOT_RUN: { icon: MinusCircleIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10' },
  PASS: { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/10' },
  FAIL: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/10' },
  BLOCKED: { icon: MinusCircleIcon, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  SKIPPED: { icon: MinusCircleIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10' },
};

export default function TestCaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch test case
  const { data: testCase, isLoading } = useQuery({
    queryKey: ['testCase', id],
    queryFn: () => testCaseService.getById(id!),
    enabled: !!id,
  });

  // Fetch execution history
  const { data: executions = [] } = useQuery({
    queryKey: ['testExecutions', id],
    queryFn: () => testExecutionService.getHistory(id!),
    enabled: !!id,
  });

  // Execute mutation
  const executeMutation = useMutation({
    mutationFn: (data: ExecuteTestData) => testExecutionService.execute(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCase', id] });
      queryClient.invalidateQueries({ queryKey: ['testExecutions', id] });
      toast.success('Test execution recorded successfully!');
      setShowExecutionModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record execution');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => testCaseService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] });
      toast.success('Test case deleted successfully!');
      navigate('/qa/test-cases');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete test case');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Case Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/qa/test-cases')} className="mt-4">
          Back to Test Cases
        </Button>
      </div>
    );
  }

  const priority = priorityConfig[testCase.priority];
  const type = typeConfig[testCase.type];
  const status = statusConfig[testCase.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate('/qa/test-cases')}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priority.bg, priority.text)}>
                {testCase.priority}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', type.bg, type.text)}>
                {testCase.type}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', status.bg, status.text)}>
                {testCase.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {testCase.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {testCase.project && (
                <Link to={`/projects/${testCase.project.id}`} className="hover:text-redstone-500">
                  {testCase.project.name}
                </Link>
              )}
              {testCase.task && (
                <>
                  <span>&gt;</span>
                  <Link to={`/tasks/${testCase.task.id}`} className="hover:text-redstone-500">
                    {testCase.task.title}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowExecutionModal(true)}
            disabled={testCase.status === 'DEPRECATED'}
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Execute
          </Button>
          <Button variant="outline" onClick={() => navigate(`/qa/test-cases/${id}/edit`)}>
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {testCase.description && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {testCase.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Preconditions */}
          {testCase.preconditions && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preconditions</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {testCase.preconditions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Test Steps */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Test Steps ({testCase.steps?.length || 0})
              </h2>
            </CardHeader>
            <CardContent>
              <TestStepsEditor steps={testCase.steps || []} onChange={() => {}} readonly />
            </CardContent>
          </Card>

          {/* Expected Result */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expected Result</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {testCase.expectedResult}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Created By</p>
                {testCase.createdBy && (
                  <div className="flex items-center gap-2">
                    <Avatar
                      firstName={testCase.createdBy.firstName}
                      lastName={testCase.createdBy.lastName}
                      avatar={testCase.createdBy.avatar}
                      size="sm"
                    />
                    <span className="text-gray-900 dark:text-white">
                      {testCase.createdBy.firstName} {testCase.createdBy.lastName}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Created At</p>
                <p className="text-gray-900 dark:text-white">{formatDate(testCase.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Last Updated</p>
                <p className="text-gray-900 dark:text-white">{formatDate(testCase.updatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Executions</p>
                <p className="text-gray-900 dark:text-white">{testCase._count?.executions || 0}</p>
              </div>
              {(testCase._count?.bugs || 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Related Bugs</p>
                  <p className="text-red-500 flex items-center gap-1">
                    <BugAntIcon className="w-4 h-4" />
                    {testCase._count?.bugs}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execution History */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Execution History</h2>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No executions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {executions.slice(0, 5).map((execution: TestExecution) => {
                    const execStatus = executionStatusConfig[execution.status];
                    return (
                      <div
                        key={execution.id}
                        className={cn('p-3 rounded-lg', execStatus.bg)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <execStatus.icon className={cn('w-5 h-5', execStatus.color)} />
                            <span className={cn('font-medium', execStatus.color)}>
                              {execution.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Run #{execution.runNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {execution.executedBy && (
                            <span>{execution.executedBy.firstName} {execution.executedBy.lastName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(execution.executedAt)}
                          </span>
                          {execution.executionTime && (
                            <span>{formatDuration(execution.executionTime)}</span>
                          )}
                        </div>
                        {execution.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {execution.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {executions.length > 5 && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      +{executions.length - 5} more executions
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Execution Modal */}
      {showExecutionModal && (
        <ExecutionModal
          testCase={testCase}
          onSubmit={(data) => executeMutation.mutate(data)}
          onClose={() => setShowExecutionModal(false)}
          isSubmitting={executeMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Test Case
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this test case? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteMutation.mutate()}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
