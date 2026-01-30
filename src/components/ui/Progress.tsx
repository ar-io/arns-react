import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@src/utils/cn';
import { forwardRef } from 'react';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorClassName, showLabel, size = 'md', ...props }, ref) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-surface',
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out',
            indicatorClassName,
          )}
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="absolute right-0 top-full mt-1 text-xs text-muted">
          {clampedValue}%
        </span>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

export default Progress;
