import { cn } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-dark-300 ring-gray-300 dark:ring-dark-600',
    success: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/20',
    warning: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/20',
    danger: 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400 ring-redstone-200 dark:ring-redstone-500/20',
    info: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-200 dark:ring-cyan-500/20',
    primary: 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-600 dark:text-redstone-400 ring-redstone-200 dark:ring-redstone-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-medium ring-1 ring-inset',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
