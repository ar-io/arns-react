import { ReactNode, useEffect, useState, useCallback } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AVERAGE_BLOCK_TIME_MS } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';

interface CountdownProps {
  targetTime: number;
  onFinish?: () => void;
  className?: string;
}

function Countdown({ targetTime, onFinish, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, targetTime - now);
      setTimeLeft(remaining);

      if (remaining === 0 && onFinish) {
        onFinish();
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onFinish]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <span className={className}>
      {minutes} min {seconds} secs
    </span>
  );
}

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

  const updateBlockHeight = useCallback(async () => {
    try {
      const blockHeight = await arweaveDataProvider.getCurrentBlockHeight();
      dispatchGlobalState({ type: 'setBlockHeight', payload: blockHeight });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }, [arweaveDataProvider, dispatchGlobalState]);

  useEffect(() => {
    if (blockHeight && lastBlockUpdateTimestamp) {
      const nextPriceChangeTimestamp =
        lastBlockUpdateTimestamp + AVERAGE_BLOCK_TIME_MS;
      setTimeUntilUpdate(nextPriceChangeTimestamp);
    } // use the price response to calculate the next interval
  }, [blockHeight, lastBlockUpdateTimestamp]);

  return (
    <div className="flex flex-row text-grey gap-2">
      <div className="whitespace-nowrap">{prefixText}</div>
      <div className="flex flex-row text-[15px] text-foreground">
        {timeUntilUpdate > 0 && (
          <Countdown
            targetTime={timeUntilUpdate}
            onFinish={updateBlockHeight}
            className="text-[15px] text-foreground"
          />
        )}
      </div>
    </div>
  );
};

export default BlockHeightCounter;
