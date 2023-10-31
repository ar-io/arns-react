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

  return (
    <div className="flex flex-row grey" style={{ gap: '8px' }}>
      <ClockClockwiseIcon />
      Next price update:
      <Countdown
        value={timeUntilUpdate}
        valueStyle={{
          fontSize: '15px',
          color: 'var(--text-grey)',
          paddingBottom: '0px',
        }}
        format="H:mm:ss"
        onFinish={() => updateBlockHeight()}
      />
    </div>
  );
};

export default NextPriceUpdate;
