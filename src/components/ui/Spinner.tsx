import { cn } from '@src/utils/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: number;
  className?: string;
  color?: string;
  message?: string;
}

function Spinner({
  size = 24,
  className,
  color,
  message,
}: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2
        className="animate-spin"
        style={{
          width: size,
          height: size,
          color: color || 'currentColor',
        }}
      />
      {message && (
        <span className="text-sm text-muted">{message}</span>
      )}
    </div>
  );
}

export { Spinner };
export default Spinner;
