import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClockIcon,
  CalendarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { timeEntryService, TimeEntryFilters } from '@/services/timeEntry.service';
import { TimeEntry } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ActiveTimerWidget from '@/components/dashboard/ActiveTimerWidget';
import { formatDateTime, formatDuration } from '@/utils/helpers';

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TimeEntryFilters>({
    page: 1,
    limit: 20,
  });

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['timeEntries', filters],
    queryFn: () =>
      timeEntryService.getAll({
        ...filters,
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

      {/* Date Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
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
            {(dateRange.startDate || dateRange.endDate) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  setFilters({ ...filters, page: 1 });
                }}
              >
                Clear
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
    </div>
  );
}

interface TimeEntryRowProps {
  entry: TimeEntry;
  onDelete: () => void;
  isDeleting: boolean;
}

function TimeEntryRow({ entry, onDelete, isDeleting }: TimeEntryRowProps) {
  return (
    <div className="py-4 flex items-center justify-between">
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
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {entry.task?.project?.name}
        </p>
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

      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {entry.duration ? formatDuration(entry.duration) : '--:--'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
