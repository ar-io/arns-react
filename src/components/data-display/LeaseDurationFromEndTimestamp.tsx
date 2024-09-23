import { formatDate, getLeaseDurationFromEndTimestamp } from '@src/utils';
import { PERMANENT_DOMAIN_MESSAGE } from '@src/utils/constants';
import { ReactNode } from 'react';

function LeaseDurationFromEndTimestamp({
  endTimestamp,
}: {
  endTimestamp?: number;
}): ReactNode {
  if (!endTimestamp) {
    return PERMANENT_DOMAIN_MESSAGE;
  }
  const leaseDuration = getLeaseDurationFromEndTimestamp(
    Date.now(),
    endTimestamp,
  );
  return (
    <>
      {' '}
      {leaseDuration} year
      {leaseDuration > 1 ? 's' : ''} &nbsp;
      <span style={{ color: 'var(--text-grey)' }}>
        (est. expiry {+endTimestamp ? formatDate(endTimestamp) : 'N/A'})
      </span>
    </>
  );
}

export default LeaseDurationFromEndTimestamp;
