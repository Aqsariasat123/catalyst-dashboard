import { useState, useEffect } from 'react';
import { StopIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { timeEntryService } from '@/services/timeEntry.service';
import { formatTime } from '@/utils/helpers';
import Button from '@/components/ui/Button';

export default function ActiveTimerWidget() {
  const queryClient = useQueryClient();
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data: activeTimer, isLoading } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: timeEntryService.getActiveTimer,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (activeTimer) {
      setElapsedTime(activeTimer.elapsedSeconds);

      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [activeTimer]);

  const stopMutation = useMutation({
    mutationFn: () => timeEntryService.stopTimer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['developerDashboard'] });
      toast.success('Timer stopped');
    },
    onError: () => {
      toast.error('Failed to stop timer');
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-dark-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!activeTimer) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-gray-200 dark:border-dark-700 h-full">
        <div className="flex flex-col items-center justify-center h-full py-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mb-4">
            <ClockIcon className="w-8 h-8 text-gray-400 dark:text-dark-500" />
          </div>
          <p className="text-gray-700 dark:text-dark-300 font-medium">No active timer</p>
          <p className="text-sm text-gray-500 dark:text-dark-500 mt-1 text-center">
            Start tracking time from your tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-redstone-500 to-redstone-700 rounded-2xl p-6 text-white shadow-xl shadow-redstone-500/20">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-75" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium text-white/80">Currently Tracking</span>
          <span className="flex items-center gap-1.5 text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live
          </span>
        </div>

        <div className="mb-5">
          <p className="text-4xl font-bold font-mono tracking-wider">{formatTime(elapsedTime)}</p>
        </div>

        <div className="mb-5 p-3 bg-white/10 backdrop-blur rounded-xl">
          <p className="font-semibold truncate">{activeTimer.taskTitle}</p>
          <p className="text-sm text-white/70 truncate mt-0.5">{activeTimer.projectName}</p>
        </div>

        <Button
          variant="secondary"
          className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur"
          onClick={() => stopMutation.mutate()}
          isLoading={stopMutation.isPending}
        >
          <StopIcon className="w-4 h-4 mr-2" />
          Stop Timer
        </Button>
      </div>
    </div>
  );
}
