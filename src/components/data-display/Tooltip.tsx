import { Tooltip as AntdTooltip, TooltipProps } from 'antd';

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
  message: JSX.Element | string;
  icon?: JSX.Element;
  tooltipOverrides?: Partial<TooltipProps>;
}) {
  return (
    <>
      <AntdTooltip
        title={message}
        color="var(--box-color)"
        className="pointer"
        overlayInnerStyle={{ padding: '15px' }}
        {...tooltipOverrides}
      >
        {icon}
      </AntdTooltip>
    </>
  );
}

export default Tooltip;
