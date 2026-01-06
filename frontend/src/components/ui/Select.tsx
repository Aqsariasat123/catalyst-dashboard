import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-gray-200 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white',
            'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
            'focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none',
            'disabled:bg-gray-300 dark:disabled:bg-black disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            'appearance-none cursor-pointer',
            error && 'border-red-500 focus:ring-red-300 dark:focus:ring-red-600 focus:border-red-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-redstone-400 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
