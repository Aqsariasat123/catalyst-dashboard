import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClockIcon,
  CalendarIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { timeEntryService, TimeEntryFilters } from '@/services/timeEntry.service';
import { userService } from '@/services/user.service';
import { TimeEntry } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ActiveTimerWidget from '@/components/dashboard/ActiveTimerWidget';
import Avatar from '@/components/ui/Avatar';
import { formatDateTime, formatDuration, cn } from '@/utils/helpers';

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdminOrPM = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const [filters, setFilters] = useState<TimeEntryFilters>({
    page: 1,
    limit: 20,
  });

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  // Fetch all users for the filter dropdown (Admin/PM only)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled: isAdminOrPM,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['timeEntries', filters, selectedUserId, dateRange],
    queryFn: () =>
      timeEntryService.getAll({
        ...filters,
        userId: selectedUserId || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['timeStats'],
    queryFn: () => timeEntryService.getUserStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timeEntryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['timeStats'] });
      toast.success('Time entry deleted');
    },
    onError: () => {
      toast.error('Failed to delete time entry');
    },
  });

  const handleDateFilter = () => {
    setFilters({ ...filters, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Time Tracking
            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400">
              {data?.meta.total || 0} Entries
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your work time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Timer */}
        <div className="lg:col-span-1">
          <ActiveTimerWidget />
        </div>

        {/* Time Stats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Time Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.totalHours || 0}h
                  </p>
                </div>
                <div className="p-4 bg-redstone-50 dark:bg-redstone-500/10 rounded-xl">
                  <p className="text-sm text-redstone-600 dark:text-redstone-400">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-redstone-600 dark:text-redstone-400 mt-1">
                    {stats?.weeklyHours || 0}h
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats?.monthlyHours || 0}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* User Filter - Admin/PM only */}
            {isAdminOrPM && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Team Member
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setFilters({ ...filters, page: 1 });
                  }}
                  className="px-3 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 min-w-[180px]"
                >
                  <option value="">All Members</option>
                  {usersData?.data?.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>
            <Button onClick={handleDateFilter} className="bg-redstone-600 hover:bg-redstone-700">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Apply Filter
            </Button>
            {(dateRange.startDate || dateRange.endDate || selectedUserId) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  setSelectedUserId('');
                  setFilters({ ...filters, page: 1 });
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No time entries found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.data.map((entry) => (
                <TimeEntryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={() => deleteMutation.mutate(entry.id)}
                  onEdit={() => setEditingEntry(entry)}
                  canEdit={isAdminOrPM || entry.userId === user?.id}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {filters.page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === data.meta.totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Time Entry Modal */}
      {editingEntry && (
        <EditTimeEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
            queryClient.invalidateQueries({ queryKey: ['timeStats'] });
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

interface TimeEntryRowProps {
  entry: TimeEntry;
  onDelete: () => void;
  onEdit: () => void;
  canEdit: boolean;
  isDeleting: boolean;
}

function TimeEntryRow({ entry, onDelete, onEdit, canEdit, isDeleting }: TimeEntryRowProps) {
  // Check if duration seems unusually long (> 12 hours)
  const isUnusuallyLong = entry.duration && entry.duration > 12 * 3600;

  return (
    <div className={cn(
      'py-4 flex items-center justify-between',
      isUnusuallyLong && 'bg-amber-50 dark:bg-amber-500/5 -mx-4 px-4 rounded-lg'
    )}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* User Avatar */}
        {entry.user && (
          <Avatar
            firstName={entry.user.firstName}
            lastName={entry.user.lastName}
            size="sm"
            className="flex-shrink-0 mt-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {entry.task?.title || 'Unknown Task'}
            </p>
            {!entry.endTime && (
              <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Running
              </span>
            )}
            {isUnusuallyLong && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                <ExclamationTriangleIcon className="w-3 h-3" />
                Long duration
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{entry.task?.project?.name}</span>
            {entry.user && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {entry.user.firstName} {entry.user.lastName}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span>{formatDateTime(entry.startTime)}</span>
            {entry.endTime && (
              <>
                <span>to</span>
                <span>{formatDateTime(entry.endTime)}</span>
              </>
            )}
          </div>
          {entry.notes && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              "{entry.notes}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <div className="text-right mr-2">
          <p className={cn(
            'text-lg font-semibold',
            isUnusuallyLong ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
          )}>
            {entry.duration ? formatDuration(entry.duration) : '--:--'}
          </p>
        </div>
        {canEdit && entry.endTime && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Edit time entry"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </Button>
        )}
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete time entry"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Edit Time Entry Modal
interface EditTimeEntryModalProps {
  entry: TimeEntry;
  onClose: () => void;
  onSuccess: () => void;
}

function EditTimeEntryModal({ entry, onClose, onSuccess }: EditTimeEntryModalProps) {
  // Format datetime for input
  const formatForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    startTime: formatForInput(entry.startTime),
    endTime: entry.endTime ? formatForInput(entry.endTime) : '',
    notes: entry.notes || '',
  });

  const [manualDuration, setManualDuration] = useState({
    hours: entry.duration ? Math.floor(entry.duration / 3600) : 0,
    minutes: entry.duration ? Math.floor((entry.duration % 3600) / 60) : 0,
  });

  const [useManualDuration, setUseManualDuration] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: { startTime?: string; endTime?: string; notes?: string }) =>
      timeEntryService.update(entry.id, data),
    onSuccess: () => {
      toast.success('Time entry updated successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update time entry');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let endTime = formData.endTime;

    // If using manual duration, calculate end time from start time + duration
    if (useManualDuration) {
      const start = new Date(formData.startTime);
      const durationSeconds = manualDuration.hours * 3600 + manualDuration.minutes * 60;
      const end = new Date(start.getTime() + durationSeconds * 1000);
      endTime = end.toISOString();
    }

    updateMutation.mutate({
      startTime: new Date(formData.startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      notes: formData.notes || undefined,
    });
  };

  // Calculate duration preview
  const calculateDuration = () => {
    if (useManualDuration) {
      return manualDuration.hours * 3600 + manualDuration.minutes * 60;
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      return Math.floor((end.getTime() - start.getTime()) / 1000);
    }
    return 0;
  };

  const previewDuration = calculateDuration();
  const isValidDuration = previewDuration > 0 && previewDuration < 24 * 3600;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-redstone-600 dark:text-redstone-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Time Entry
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {entry.task?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning for long durations */}
          {entry.duration && entry.duration > 12 * 3600 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Unusually long duration detected
                </p>
                <p className="text-amber-700 dark:text-amber-400 mt-1">
                  This entry is over 12 hours. The timer may have been left running. Please adjust the time accordingly.
                </p>
              </div>
            </div>
          )}

          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
              required
            />
          </div>

          {/* Duration Mode Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useManualDuration}
                onChange={() => setUseManualDuration(false)}
                className="w-4 h-4 text-redstone-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set end time</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useManualDuration}
                onChange={() => setUseManualDuration(true)}
                className="w-4 h-4 text-redstone-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set duration manually</span>
            </label>
          </div>

          {/* End Time OR Manual Duration */}
          {!useManualDuration ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={manualDuration.hours}
                  onChange={(e) => setManualDuration({ ...manualDuration, hours: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-redstone-500"
                />
                <span className="text-gray-500">h</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={manualDuration.minutes}
                  onChange={(e) => setManualDuration({ ...manualDuration, minutes: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg text-sm text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-redstone-500"
                />
                <span className="text-gray-500">m</span>
              </div>
            </div>
          )}

          {/* Duration Preview */}
          <div className="p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">New Duration:</span>
              <span className={cn(
                'text-lg font-bold',
                isValidDuration ? 'text-gray-900 dark:text-white' : 'text-red-500'
              )}>
                {previewDuration > 0 ? formatDuration(previewDuration) : '--:--'}
              </span>
            </div>
            {previewDuration >= 24 * 3600 && (
              <p className="text-xs text-red-500 mt-1">Duration cannot exceed 24 hours</p>
            )}
            {previewDuration <= 0 && formData.startTime && (useManualDuration || formData.endTime) && (
              <p className="text-xs text-red-500 mt-1">End time must be after start time</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
              placeholder="What did you work on?"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={updateMutation.isPending}
              disabled={!isValidDuration}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
