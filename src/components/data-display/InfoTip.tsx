import { Tooltip, TooltipProps } from 'antd';

import { InfoIcon } from '../icons';

function InfoTip({
  message,
  icon = (
    <InfoIcon
      style={{ fontSize: '20px', fill: 'var(--text-grey)', width: '20px' }}
    />
  ),
  tooltipOverrides,
}: {
  message: string;
  icon?: JSX.Element;
  tooltipOverrides?: Partial<TooltipProps>;
}) {
  return (
    <>
      <Tooltip
        title={message}
        color="var(--card-bg)"
        className="pointer"
        {...tooltipOverrides}
      >
        {icon}
      </Tooltip>
    </>
  );
}

export default InfoTip;
