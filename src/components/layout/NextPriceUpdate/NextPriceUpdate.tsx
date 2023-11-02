import Countdown from 'antd/lib/statistic/Countdown';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { Auction } from '../../../types';
import { getNextPriceChangeTimestamp } from '../../../utils';
import eventEmitter from '../../../utils/events';
import { ClockClockwiseIcon } from '../../icons';

const NextPriceUpdate = ({ auction }: { auction: Auction }) => {
  const [{ blockHeight, arweaveDataProvider }, dispatchGlobalState] =
    useGlobalState();

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
    if (blockHeight && auction) {
      const nextPriceChangeTimestamp = getNextPriceChangeTimestamp({
        currentBlockHeight: blockHeight,
        prices: auction.prices,
      });

      setTimeUntilUpdate(nextPriceChangeTimestamp);
    } // use the price response to calculate the next interval
  }, [blockHeight, auction]);

  const lessThanOneMinute = timeUntilUpdate - Date.now() < 60000;

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
              format="m"
              valueStyle={{
                fontSize: '15px',
                color: 'var(--text-white)',
                display: lessThanOneMinute ? 'none' : 'block',
              }}
              onFinish={() => updateBlockHeight()}
            />
            {lessThanOneMinute && <span>&lt; 1</span>}
            &nbsp;min
          </>
        )}
      </div>
    </div>
  );
};

export default NextPriceUpdate;
