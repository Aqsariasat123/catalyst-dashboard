import { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { TestStep } from '@/types/qa.types';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

interface TestStepsEditorProps {
  steps: TestStep[];
  onChange: (steps: TestStep[]) => void;
  readonly?: boolean;
}

export default function TestStepsEditor({ steps, onChange, readonly = false }: TestStepsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addStep = () => {
    onChange([...steps, { step: '', expected: '' }]);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof TestStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onChange(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    onChange(newSteps);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSteps = [...steps];
    const draggedStep = newSteps[draggedIndex];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(index, 0, draggedStep);
    setDraggedIndex(index);
    onChange(newSteps);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (readonly) {
    return (
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center text-redstone-600 dark:text-redstone-400 font-medium text-sm">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Step
                  </p>
                  <p className="text-gray-900 dark:text-white">{step.step}</p>
                </div>
                {step.expected && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Expected Result
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{step.expected}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {steps.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No steps defined
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            'bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all',
            draggedIndex === index && 'opacity-50 scale-[0.98]'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Drag handle & Step number */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-redstone-100 dark:bg-redstone-500/10 flex items-center justify-center text-redstone-600 dark:text-redstone-400 font-medium text-sm">
                {index + 1}
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Step Description
                </label>
                <textarea
                  value={step.step}
                  onChange={(e) => updateStep(index, 'step', e.target.value)}
                  placeholder="Describe what action to perform..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Expected Result
                </label>
                <textarea
                  value={step.expected}
                  onChange={(e) => updateStep(index, 'expected', e.target.value)}
                  placeholder="Describe the expected outcome..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-redstone-500 resize-none text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500"
              >
                <ArrowDownIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addStep}
        className="w-full"
      >
        <PlusIcon className="w-4 h-4 mr-2" />
        Add Step
      </Button>
    </div>
  );
}
