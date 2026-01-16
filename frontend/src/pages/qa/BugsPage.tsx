import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  BugAntIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { bugService } from '@/services/bug.service';
import { Bug, BugFilters } from '@/types/qa.types';
import BugList from '@/components/qa/BugList';
import BugFiltersComponent from '@/components/qa/BugFilters';
import BugDetailModal from '@/components/qa/BugDetailModal';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

export default function BugsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Check if user is a developer (not admin, PM, or QC)
  const isDeveloper = user?.role === 'DEVELOPER' || user?.role === 'DESIGNER';
  const isQC = user?.role === 'QC';

  const [filters, setFilters] = useState<BugFilters>({
    page: 1,
    limit: 10,
  });

  // For developers, automatically filter by their assigned bugs
  const effectiveFilters = useMemo(() => {
    if (isDeveloper && user?.id) {
      return { ...filters, assignedToId: user.id };
    }
    return filters;
  }, [filters, isDeveloper, user?.id]);

  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [deleteConfirmBug, setDeleteConfirmBug] = useState<Bug | null>(null);

  // Fetch bugs
  const { data: bugsData, isLoading } = useQuery({
    queryKey: ['bugs', effectiveFilters],
    queryFn: () => bugService.getAll(effectiveFilters),
  });

  const bugs = bugsData?.data || [];
  const meta = bugsData?.meta;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bugService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      toast.success('Bug deleted successfully!');
      setDeleteConfirmBug(null);
      setSelectedBug(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete bug');
    },
  });

  const handleView = (bug: Bug) => {
    setSelectedBug(bug);
  };

  const handleEdit = (bug: Bug) => {
    navigate(`/qa/bugs/${bug.id}/edit`);
  };

  const handleDelete = (bug: Bug) => {
    setDeleteConfirmBug(bug);
  };

  const confirmDelete = () => {
    if (deleteConfirmBug) {
      deleteMutation.mutate(deleteConfirmBug.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate stats
  const openBugs = bugs.filter((b) => b.status === 'OPEN' || b.status === 'REOPENED').length;
  const inProgressBugs = bugs.filter((b) => b.status === 'IN_PROGRESS').length;
  const criticalBugs = bugs.filter((b) => b.severity === 'CRITICAL' && b.status !== 'CLOSED').length;
  const closedBugs = bugs.filter((b) => b.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BugAntIcon className="w-7 h-7 text-redstone-500" />
            {isDeveloper ? 'My Bugs' : 'Bug Tracking'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isDeveloper ? 'Bugs assigned to you for fixing' : 'Track and manage bugs and defects'}
          </p>
        </div>
        {!isDeveloper && (
          <Button variant="primary" onClick={() => navigate('/qa/bugs/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Report Bug
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{openBugs}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Open Bugs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-cyan-600">{inProgressBugs}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange-600">{criticalBugs}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{closedBugs}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <BugFiltersComponent filters={filters} onChange={setFilters} />

      {/* Bugs List */}
      <BugList
        bugs={bugs}
        isLoading={isLoading}
        onView={handleView}
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

      {/* Bug Detail Modal */}
      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
          onEdit={() => {
            handleEdit(selectedBug);
            setSelectedBug(null);
          }}
          onDelete={() => {
            setDeleteConfirmBug(selectedBug);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBug && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmBug(null)} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Bug
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "BUG-{deleteConfirmBug.bugNumber}: {deleteConfirmBug.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirmBug(null)}>
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
