import Countdown from 'antd/lib/statistic/Countdown';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { Auction } from '../../../types';
import { AVERAGE_BLOCK_TIME_MS } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { ClockClockwiseIcon } from '../../icons';

const NextPriceUpdate = ({ auction }: { auction: Auction }) => {
  const [
    { blockHeight, lastBlockUpdateTimestamp, arweaveDataProvider },
    dispatchGlobalState,
  ] = useGlobalState();

  const [timeUntilUpdate, setTimeUntilUpdate] = useState<number>(0);

  const updateBlockHeight = async () => {
    try {
      const blockHeight = await arweaveDataProvider.getCurrentBlockHeight();
      dispatchGlobalState({ type: 'setBlockHeight', payload: blockHeight });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  };

  useEffect(() => {
    if (blockHeight && auction && lastBlockUpdateTimestamp) {
      const nextPriceChangeTimestamp =
        lastBlockUpdateTimestamp + AVERAGE_BLOCK_TIME_MS;
      setTimeUntilUpdate(nextPriceChangeTimestamp);
    } // use the price response to calculate the next interval
  }, [blockHeight, lastBlockUpdateTimestamp, auction]);

  return (
    <div className="flex flex-row grey" style={{ gap: '8px' }}>
      <ClockClockwiseIcon />
      <div style={{ whiteSpace: 'nowrap' }}>Next price update:</div>
      <div
        className="flex flex-row"
        style={{
          gap: '0px',
          fontSize: '15px',
          color: 'var(--text-white)',
          paddingBottom: '0px',
        }}
      >
        {timeUntilUpdate > 0 && (
          <>
            <Countdown
              value={timeUntilUpdate}
              format="m [min] s [secs]"
              valueStyle={{
                fontSize: '15px',
                color: 'var(--text-white)',
                display: 'block',
              }}
              onFinish={() => updateBlockHeight()}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default NextPriceUpdate;
