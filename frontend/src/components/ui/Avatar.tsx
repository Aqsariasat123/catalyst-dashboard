import { cn, getInitials } from '@/utils/helpers';

interface AvatarProps {
  firstName: string;
  lastName: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({
  firstName,
  lastName,
  avatar,
  size = 'md',
  className,
}: AvatarProps) {
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-xl object-cover ring-2 ring-dark-700', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-redstone-500 to-redstone-700 flex items-center justify-center font-semibold text-white shadow-lg shadow-redstone-500/20',
        sizes[size],
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
