import { cn } from '@src/utils/cn';
import { Check, AlertOctagon } from 'lucide-react';
import { ReactNode } from 'react';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepProps {
  title?: ReactNode;
  description?: ReactNode;
  status?: StepStatus;
  icon?: ReactNode;
}

export interface StepsProps {
  items: StepProps[];
  current: number;
  className?: string;
  size?: 'sm' | 'md';
}

function Steps({ items, current, className, size = 'md' }: StepsProps) {
  const sizeClasses = {
    sm: {
      circle: 'size-6 text-xs',
      title: 'text-xs',
      description: 'text-[10px]',
      line: 'h-[2px]',
    },
    md: {
      circle: 'size-8 text-sm',
      title: 'text-sm',
      description: 'text-xs',
      line: 'h-[2px]',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex w-full items-start', className)}>
      {items.map((item, index) => {
        const status = item.status || (index < current ? 'finish' : index === current ? 'process' : 'wait');
        const isLast = index === items.length - 1;

        return (
          <div
            key={index}
            className={cn('flex flex-1 items-start', isLast && 'flex-none')}
          >
            <div className="flex flex-col items-center">
              <StepIcon
                status={status}
                index={index}
                icon={item.icon}
                sizeClass={sizes.circle}
              />
              {item.title && (
                <span
                  className={cn(
                    'mt-2 text-center whitespace-nowrap',
                    sizes.title,
                    status === 'wait' ? 'text-muted' : 'text-foreground',
                  )}
                >
                  {item.title}
                </span>
              )}
              {item.description && (
                <span
                  className={cn(
                    'text-center whitespace-nowrap',
                    sizes.description,
                    status === 'process' ? 'text-foreground' : 'text-muted',
                  )}
                >
                  {item.description}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  'mx-2 mt-4 flex-1',
                  sizes.line,
                  status === 'finish' ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepIcon({
  status,
  index,
  icon,
  sizeClass,
}: {
  status: StepStatus;
  index: number;
  icon?: ReactNode;
  sizeClass: string;
}) {
  const baseClasses = cn(
    'flex items-center justify-center rounded-full font-bold transition-colors',
    sizeClass,
  );

  if (icon) {
    return <span className={baseClasses}>{icon}</span>;
  }

  switch (status) {
    case 'finish':
      return (
        <span className={cn(baseClasses, 'border border-primary text-primary')}>
          <Check className="size-4" />
        </span>
      );
    case 'error':
      return (
        <span className={cn(baseClasses, 'border border-error text-error')}>
          <AlertOctagon className="size-4" />
        </span>
      );
    case 'process':
      return (
        <span
          className={cn(
            baseClasses,
            'border border-primary bg-primary text-primary-foreground',
          )}
        >
          {index + 1}
        </span>
      );
    case 'wait':
    default:
      return (
        <span className={cn(baseClasses, 'border border-muted text-muted')}>
          {index + 1}
        </span>
      );
  }
}

export { Steps, StepIcon };
export default Steps;
