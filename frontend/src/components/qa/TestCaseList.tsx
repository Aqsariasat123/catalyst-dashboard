import { TestCase } from '@/types/qa.types';
import TestCaseCard from './TestCaseCard';
import { BeakerIcon } from '@heroicons/react/24/outline';

interface TestCaseListProps {
  testCases: TestCase[];
  isLoading?: boolean;
  onExecute: (testCase: TestCase) => void;
  onEdit?: (testCase: TestCase) => void;
  onDelete?: (testCase: TestCase) => void;
}

export default function TestCaseList({
  testCases,
  isLoading,
  onExecute,
  onEdit,
  onDelete,
}: TestCaseListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-redstone-500" />
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BeakerIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No Test Cases Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          No test cases match your current filters. Try adjusting your search or create a new test case.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testCases.map((testCase) => (
        <TestCaseCard
          key={testCase.id}
          testCase={testCase}
          onExecute={onExecute}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
