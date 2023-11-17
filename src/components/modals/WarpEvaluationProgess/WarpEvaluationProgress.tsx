import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ARNS_REGISTRY_ADDRESS } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';

export const evaluationProgessEmitter = new EventEmitter();

function WarpEvaluationProgress({
  contractTxId,
  writingTransaction,
  warmTickStateCallback,
}: {
  contractTxId: ArweaveTransactionID;
  writingTransaction: boolean;
  warmTickStateCallback: (state: boolean) => void; // callback when finished warming network cach
}) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const [tickStateWarmed, setTickStateWarmed] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState<
    number | undefined
  >();
  // implement listeners for warp evaluation progress
  useEffect(() => {
    if (
      contractTxId.toString() === ARNS_REGISTRY_ADDRESS.toString() &&
      writingTransaction
    ) {
      handleWarmTickState();
    }
    evaluationProgessEmitter.on(
      'progress-notification',
      tickEvaluationProgress,
    );
    return () => {
      evaluationProgessEmitter.off(
        'progress-notification',
        tickEvaluationProgress,
      );
    };
  }, [contractTxId]);

  function parseProgressMessage(message: string) {
    const [contractTxId, progress, evalTime] = message.split(' ');
    const [currentInteractionNumber, totalInteractionCount] =
      progress.split('/');
    return {
      contractTxId,
      currentInteractionNumber: parseInt(currentInteractionNumber),
      totalInteractionCount: parseInt(totalInteractionCount),
      evalTime: parseInt(evalTime.replace(/[[\]ms]/g, '')),
    };
  }

  function tickEvaluationProgress({ message }: { message: string }) {
    const { currentInteractionNumber, totalInteractionCount } =
      parseProgressMessage(message);
    const percentage =
      (Math.max(1, currentInteractionNumber) / totalInteractionCount) * 100;
    console.log(percentage, message);
    if (percentage >= 100) {
      return setEvaluationProgress(undefined);
    }
    return setEvaluationProgress(percentage);
  }

  async function handleWarmTickState() {
    try {
      const handleTickStateProgress = (current: number, total: number) => {
        const percentage = (current / total) * 100;
        setEvaluationProgress(percentage);
      };
      await arweaveDataProvider.warmTickStateCache({
        progressCallback: handleTickStateProgress,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setTickStateWarmed(true);
      warmTickStateCallback(true);
      setEvaluationProgress(undefined);
    }
  }

  return (
    <>
      <PageLoader
        loading={writingTransaction}
        message={
          <div
            className="flex flex-column white center"
            style={{ gap: '10px' }}
          >
            <span className="bold" style={{ fontSize: '18px' }}>
              Writing transaction, please wait.
            </span>
            <span style={{ fontSize: '16px' }}>
              {!tickStateWarmed &&
              contractTxId.toString() === ARNS_REGISTRY_ADDRESS.toString()
                ? 'Fetching Block Data'
                : 'Evaluating contract'}
            </span>
            <span style={{ fontSize: '14px' }}>
              {evaluationProgress
                ? `${evaluationProgress?.toPrecision(4)}%`
                : 'calculating...'}
            </span>
          </div>
        }
      />
    </>
  );
}

export default WarpEvaluationProgress;
