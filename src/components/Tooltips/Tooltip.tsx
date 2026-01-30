import { Tooltip as RadixTooltip } from '@src/components/ui/Tooltip';
import { ReactNode } from 'react';

import { InfoIcon } from '../icons';

function Tooltip({
  message,
  icon = (
    <InfoIcon
      style={{ fontSize: '20px', fill: 'var(--text-grey)', width: '20px' }}
    />
  ),
}: {
  message: JSX.Element | string;
  icon?: ReactNode;
  tooltipOverrides?: Record<string, unknown>;
}) {
  return (
    <RadixTooltip content={message} contentClassName="max-w-xs p-4">
      <span className="cursor-pointer inline-flex">{icon}</span>
    </RadixTooltip>
  );
}

export default Tooltip;
