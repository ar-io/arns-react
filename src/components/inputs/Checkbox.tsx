import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import classnames from 'classnames';
import { Check } from 'lucide-react';
import * as React from 'react';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode;
  className?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <CheckboxPrimitive.Root
        ref={ref}
        className={classnames(
          'peer size-3 shrink-0 rounded-sm border border-grey ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-transparent data-[state=checked]:text-white',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={classnames('flex items-center justify-center')}
        >
          <Check className="size-2" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={props.id}
          className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap"
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
