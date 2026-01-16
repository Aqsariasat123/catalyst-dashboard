import { useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  ClockIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline';
import { TestCase, ExecutionStatus, StepResult, ExecuteTestData } from '@/types/qa.types';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

interface ExecutionModalProps {
  testCase: TestCase;
  onSubmit: (data: ExecuteTestData) => void;
  onCreateBug?: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const statusOptions: { value: ExecutionStatus; label: string; icon: any; color: string; bg: string }[] = [
  { value: 'PASS', label: 'Pass', icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-500/10 border-green-300 dark:border-green-500/30' },
  { value: 'FAIL', label: 'Fail', icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30' },
  { value: 'BLOCKED', label: 'Blocked', icon: MinusCircleIcon, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30' },
  { value: 'SKIPPED', label: 'Skipped', icon: MinusCircleIcon, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-500/10 border-gray-300 dark:border-gray-500/30' },
];

export default function ExecutionModal({
  testCase,
  onSubmit,
  onCreateBug,
  onClose,
  isSubmitting,
}: ExecutionModalProps) {
  const [status, setStatus] = useState<ExecutionStatus>('PASS');
  const [notes, setNotes] = useState('');
  const [stepResults, setStepResults] = useState<StepResult[]>(
    testCase.steps.map((_, index) => ({ stepIndex: index, passed: true, notes: '' }))
  );
  const [startTime] = useState(Date.now());

  const handleStepResultChange = (index: number, passed: boolean) => {
    setStepResults((prev) => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], passed };
      return newResults;
    });
  };

  const handleStepNoteChange = (index: number, stepNotes: string) => {
    setStepResults((prev) => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], notes: stepNotes };
      return newResults;
    });
  };

  const handleSubmit = () => {
    const executionTime = Math.floor((Date.now() - startTime) / 1000);

    onSubmit({
      status,
      notes: notes || undefined,
      executionTime,
      stepResults: stepResults.map((r) => ({
        ...r,
        notes: r.notes || undefined,
      })),
    });
  };

  // Auto-set overall status based on step results
  const allStepsPassed = stepResults.every((r) => r.passed);
  const anyStepFailed = stepResults.some((r) => !r.passed);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Execute Test Case
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-md">
                {testCase.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Steps Checklist */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Test Steps
              </h4>
              <div className="space-y-3">
                {testCase.steps.map((step, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      stepResults[index].passed
                        ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20'
                        : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleStepResultChange(index, !stepResults[index].passed)}
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                          stepResults[index].passed
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        )}
                      >
                        {stepResults[index].passed ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <XCircleIcon className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Step {index + 1}: {step.step}
                        </p>
                        {step.expected && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Expected: {step.expected}
                          </p>
                        )}
                        <input
                          type="text"
                          value={stepResults[index].notes || ''}
                          onChange={(e) => handleStepNoteChange(index, e.target.value)}
                          placeholder="Add note for this step..."
                          className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-redstone-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Result */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Result
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {testCase.expectedResult}
              </p>
            </div>

            {/* Overall Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Overall Status
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                      status === option.value
                        ? `${option.bg} border-current`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <option.icon
                      className={cn(
                        'w-6 h-6',
                        status === option.value ? option.color : 'text-gray-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        status === option.value ? option.color : 'text-gray-500'
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              {anyStepFailed && status === 'PASS' && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
                  Note: Some steps failed. Consider marking as Fail.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Execution Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any observations or notes about this execution..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none"
              />
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span>Execution time will be recorded automatically</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black flex items-center justify-between">
            <div>
              {status === 'FAIL' && onCreateBug && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCreateBug}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <BugAntIcon className="w-4 h-4 mr-1.5" />
                  Report Bug
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Submit Result
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
