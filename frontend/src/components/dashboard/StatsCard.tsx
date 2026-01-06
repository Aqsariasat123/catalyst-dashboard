import { cn } from '@/utils/helpers';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      card: 'bg-white dark:bg-black border-gray-200 dark:border-gray-800',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-300',
    },
    primary: {
      card: 'bg-gradient-to-br from-redstone-50 dark:from-redstone-500/10 to-white dark:to-black border-redstone-200 dark:border-redstone-500/20',
      iconBg: 'bg-redstone-100 dark:bg-redstone-500/20',
      iconColor: 'text-redstone-600 dark:text-redstone-400',
    },
    success: {
      card: 'bg-gradient-to-br from-emerald-50 dark:from-emerald-500/10 to-white dark:to-black border-emerald-200 dark:border-emerald-500/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      card: 'bg-gradient-to-br from-amber-50 dark:from-amber-500/10 to-white dark:to-black border-amber-200 dark:border-amber-500/20',
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/10',
        styles.card,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                  trend.isPositive
                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-redstone-100 dark:bg-redstone-500/10 text-redstone-700 dark:text-redstone-400'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn('p-4 rounded-xl', styles.iconBg)}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
