import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '@src/utils/cn';
import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

export interface AccordionProps {
  children: ReactNode;
  title: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

function Accordion({
  children,
  title,
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className={cn('w-full', className)}
    >
      <CollapsiblePrimitive.Trigger
        className={cn(
          'flex w-full items-center justify-center gap-2 py-2 text-foreground font-bold transition-colors hover:text-foreground/80',
          triggerClassName,
        )}
      >
        <span className="relative flex items-center gap-2">
          {title}
          <ChevronDown
            className={cn(
              'size-3 shrink-0 transition-transform duration-200',
              open ? 'rotate-0' : '-rotate-90',
            )}
          />
        </span>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content
        className={cn(
          'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
          contentClassName,
        )}
      >
        <div className="pt-2">{children}</div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

export { Accordion };
export default Accordion;
