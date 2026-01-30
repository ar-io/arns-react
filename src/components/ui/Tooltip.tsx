import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@src/utils/cn';
import { ReactNode, forwardRef } from 'react';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  contentClassName?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  asChild?: boolean;
}

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = forwardRef<HTMLButtonElement, TooltipProps>(
  (
    {
      children,
      content,
      side = 'top',
      align = 'center',
      delayDuration = 200,
      className,
      contentClassName,
      open,
      defaultOpen,
      onOpenChange,
      asChild = true,
    },
    ref,
  ) => {
    return (
      <TooltipPrimitive.Root
        delayDuration={delayDuration}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger
          ref={ref}
          asChild={asChild}
          className={cn('cursor-pointer', className)}
        >
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={5}
            className={cn(
              'z-50 overflow-hidden rounded bg-surface border border-border px-3 py-2 text-sm text-foreground shadow-tooltip',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2',
              contentClassName,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-surface" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  },
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
