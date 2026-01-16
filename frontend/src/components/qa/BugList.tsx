import { Bug } from '@/types/qa.types';
import BugCard from './BugCard';
import { BugAntIcon } from '@heroicons/react/24/outline';

interface BugListProps {
  bugs: Bug[];
  isLoading?: boolean;
  onView: (bug: Bug) => void;
  onEdit?: (bug: Bug) => void;
  onDelete?: (bug: Bug) => void;
  onStatusChange?: (bug: Bug) => void;
}

export default function BugList({
  bugs,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: BugListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
      </div>
    );
  }

  if (bugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BugAntIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No Bugs Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          No bugs match your current filters. Try adjusting your search or report a new bug.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bugs.map((bug) => (
        <BugCard
          key={bug.id}
          bug={bug}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
