import Countdown from 'antd/lib/statistic/Countdown';
import { ReactNode, useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AVERAGE_BLOCK_TIME_MS } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';

const BlockHeightCounter = ({
  prefixText = 'Next price update:',
}: {
  prefixText?: ReactNode;
}) => {
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
    if (blockHeight && lastBlockUpdateTimestamp) {
      const nextPriceChangeTimestamp =
        lastBlockUpdateTimestamp + AVERAGE_BLOCK_TIME_MS;
      setTimeUntilUpdate(nextPriceChangeTimestamp);
    } // use the price response to calculate the next interval
  }, [blockHeight, lastBlockUpdateTimestamp]);

  return (
    <div className="flex flex-row grey" style={{ gap: '8px' }}>
      <div style={{ whiteSpace: 'nowrap' }}>{prefixText}</div>
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

export default BlockHeightCounter;
