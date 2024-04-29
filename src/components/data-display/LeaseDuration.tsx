import { getLeaseDurationFromEndTimestamp } from '@src/utils';
import { Skeleton } from 'antd';

export const getLeaseDurationString = (
  startTimestamp: number,
  endTimestamp: number,
) => {
  if (endTimestamp) {
    const duration = Math.max(
      1,
      getLeaseDurationFromEndTimestamp(
        startTimestamp * 1000,
        endTimestamp * 1000,
      ),
    );
    const y = duration > 1 ? 'years' : 'year';
    return `${duration} ${y}`;
  }
  return 'Indefinite';
};

export default function LeaseDuration({
  startTimestamp,
  endTimestamp,
}: {
  startTimestamp?: number;
  endTimestamp?: number;
}) {
  if (!startTimestamp || !endTimestamp) return <Skeleton.Input active />;
  return <>{getLeaseDurationString(startTimestamp, endTimestamp)}</>;
}
