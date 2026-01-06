import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-gray-200 dark:bg-dark-800 border rounded-xl text-gray-900 dark:text-white',
            'border-gray-300 dark:border-dark-700 hover:border-gray-400 dark:hover:border-dark-600',
            'focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none',
            'placeholder:text-gray-500 dark:placeholder:text-dark-500',
            'disabled:bg-gray-300 dark:disabled:bg-dark-900 disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-300 dark:focus:ring-red-600 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-redstone-400 animate-fade-in">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-dark-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
