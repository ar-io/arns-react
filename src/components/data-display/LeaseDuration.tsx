import { getLeaseDurationFromEndTimestamp } from '@src/utils';
import { PERMANENT_DOMAIN_MESSAGE } from '@src/utils/constants';

export const getLeaseDurationString = (
  startTimestamp: number,
  endTimestamp: number,
) => {
  if (endTimestamp) {
    const duration = Math.max(
      1,
      getLeaseDurationFromEndTimestamp(startTimestamp, endTimestamp),
    );
    const y = duration > 1 ? 'years' : 'year';
    return `${duration} ${y}`;
  }
  return PERMANENT_DOMAIN_MESSAGE;
};

export default function LeaseDuration({
  startTimestamp,
  endTimestamp,
}: {
  startTimestamp?: number;
  endTimestamp?: number;
}) {
  if (!startTimestamp || !endTimestamp) return PERMANENT_DOMAIN_MESSAGE;
  return <>{getLeaseDurationString(startTimestamp, endTimestamp)}</>;
}
