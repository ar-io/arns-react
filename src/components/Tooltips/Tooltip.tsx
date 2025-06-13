import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

import { InfoIcon } from '../icons';

function Tooltip({
  message,
  icon = (
    <InfoIcon
      style={{ fontSize: '20px', fill: 'var(--text-grey)', width: '20px' }}
    />
  ),
  tooltipOverrides,
}: {
  message: ReactNode;
  icon?: ReactNode;
  tooltipOverrides?: any;
}) {
  return (
    <TooltipPrimitive.Root {...tooltipOverrides}>
      <TooltipPrimitive.Trigger asChild className="cursor-pointer">
        {icon}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        sideOffset={5}
        className="z-50 rounded px-4 py-2 bg-[var(--box-color)]"
        {...tooltipOverrides}
      >
        {message}
        <TooltipPrimitive.Arrow className="fill-[var(--box-color)]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}

export default Tooltip;
