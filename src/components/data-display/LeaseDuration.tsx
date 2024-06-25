import { getLeaseDurationFromEndTimestamp } from '@src/utils';

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
  return 'Indefinite';
};

export default function LeaseDuration({
  startTimestamp,
  endTimestamp,
}: {
  startTimestamp?: number;
  endTimestamp?: number;
}) {
  if (!startTimestamp || !endTimestamp) return 'Indefinite';
  return <>{getLeaseDurationString(startTimestamp, endTimestamp)}</>;
}
