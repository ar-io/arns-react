import { cn } from '@src/utils/cn';
import { ReactNode, Children, isValidElement } from 'react';

export interface DescriptionsProps {
  children: ReactNode;
  bordered?: boolean;
  colon?: boolean;
  column?: number;
  layout?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
}

export interface DescriptionsItemProps {
  label: ReactNode;
  children: ReactNode;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  className?: string;
}

function DescriptionsItem({
  label,
  children,
  labelStyle,
  contentStyle,
  className,
}: DescriptionsItemProps) {
  return (
    <div
      className={cn('flex flex-row py-2 border-b border-dark-grey/50 last:border-b-0', className)}
    >
      <span
        className="text-muted whitespace-nowrap min-w-[120px] pr-4"
        style={labelStyle}
      >
        {label}
      </span>
      <span
        className="text-foreground flex-1 text-left"
        style={contentStyle}
      >
        {children}
      </span>
    </div>
  );
}

function Descriptions({
  children,
  bordered = false,
  layout = 'horizontal',
  style,
  className,
}: DescriptionsProps) {
  const isVertical = layout === 'vertical';

  return (
    <div
      className={cn(
        'flex flex-col w-full',
        bordered && 'border border-dark-grey rounded-md p-4',
        className,
      )}
      style={style}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return null;
        
        // Clone the child with vertical layout styling if needed
        if (isVertical) {
          return (
            <div className="flex flex-col py-2 border-b border-dark-grey/50 last:border-b-0 gap-1">
              <span
                className="text-muted whitespace-nowrap"
                style={child.props.labelStyle}
              >
                {child.props.label}
              </span>
              <span
                className="text-foreground"
                style={child.props.contentStyle}
              >
                {child.props.children}
              </span>
            </div>
          );
        }
        
        return child;
      })}
    </div>
  );
}

// Attach Item as a static property for antd-like API
Descriptions.Item = DescriptionsItem;

export { Descriptions, DescriptionsItem };
export default Descriptions;
