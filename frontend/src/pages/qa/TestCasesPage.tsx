import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  BeakerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { testCaseService } from '@/services/testCase.service';
import { testExecutionService } from '@/services/testExecution.service';
import { TestCase, TestCaseFilters, ExecuteTestData } from '@/types/qa.types';
import TestCaseList from '@/components/qa/TestCaseList';
import TestCaseFiltersComponent from '@/components/qa/TestCaseFilters';
import ExecutionModal from '@/components/qa/ExecutionModal';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function TestCasesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<TestCaseFilters>({
    page: 1,
    limit: 10,
  });

  const [executingTestCase, setExecutingTestCase] = useState<TestCase | null>(null);
  const [deleteConfirmTestCase, setDeleteConfirmTestCase] = useState<TestCase | null>(null);

  // Fetch test cases
  const { data: testCasesData, isLoading } = useQuery({
    queryKey: ['testCases', filters],
    queryFn: () => testCaseService.getAll(filters),
  });

  const testCases = testCasesData?.data || [];
  const meta = testCasesData?.meta;

  // Execute test mutation
  const executeMutation = useMutation({
    mutationFn: ({ testCaseId, data }: { testCaseId: string; data: ExecuteTestData }) =>
      testExecutionService.execute(testCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] });
      queryClient.invalidateQueries({ queryKey: ['testExecutions'] });
      toast.success('Test execution recorded successfully!');
      setExecutingTestCase(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record execution');
    },
  });

  // Delete test case mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => testCaseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] });
      toast.success('Test case deleted successfully!');
      setDeleteConfirmTestCase(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete test case');
    },
  });

  const handleExecute = (testCase: TestCase) => {
    setExecutingTestCase(testCase);
  };

  const handleEdit = (testCase: TestCase) => {
    navigate(`/qa/test-cases/${testCase.id}/edit`);
  };

  const handleDelete = (testCase: TestCase) => {
    setDeleteConfirmTestCase(testCase);
  };

  const confirmDelete = () => {
    if (deleteConfirmTestCase) {
      deleteMutation.mutate(deleteConfirmTestCase.id);
    }
  };

  const handleExecutionSubmit = (data: ExecuteTestData) => {
    if (executingTestCase) {
      executeMutation.mutate({ testCaseId: executingTestCase.id, data });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BeakerIcon className="w-7 h-7 text-redstone-500" />
            Test Cases
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and execute test cases for quality assurance
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/qa/test-cases/new')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Test Case
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {meta?.total || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Test Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {testCases.filter((tc) => tc.status === 'ACTIVE').length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-600">
              {testCases.filter((tc) => tc.status === 'DRAFT').length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">
              {testCases.filter((tc) => tc.lastExecution?.status === 'FAIL').length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TestCaseFiltersComponent filters={filters} onChange={setFilters} />

      {/* Test Cases List */}
      <TestCaseList
        testCases={testCases}
        isLoading={isLoading}
        onExecute={handleExecute}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(meta.page - 1) * meta.limit + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Execution Modal */}
      {executingTestCase && (
        <ExecutionModal
          testCase={executingTestCase}
          onSubmit={handleExecutionSubmit}
          onClose={() => setExecutingTestCase(null)}
          isSubmitting={executeMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTestCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmTestCase(null)} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Test Case
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{deleteConfirmTestCase.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirmTestCase(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
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
