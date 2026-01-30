import { cn } from '@src/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-skeleton-pulse',
    wave: 'animate-pulse',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-surface',
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      style={{
        width: width,
        height: height,
        ...(variant === 'text' && !height && { height: '1em' }),
      }}
      {...props}
    />
  );
}

// Convenience components
function SkeletonText({ className, lines = 1, ...props }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonAvatar({ className, size = 40, ...props }: SkeletonProps & { size?: number }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

export { Skeleton, SkeletonText, SkeletonAvatar };
export default Skeleton;
