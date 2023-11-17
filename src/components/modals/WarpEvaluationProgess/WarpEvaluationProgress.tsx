import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';

export const evaluationProgessEmitter = new EventEmitter();

function WarpEvaluationProgress({
  contractTxId,
  writingTransaction,
}: {
  contractTxId: ArweaveTransactionID;
  writingTransaction: boolean;
}) {
  const [evaluationProgress, setEvaluationProgress] = useState<
    number | undefined
  >();
  // implement listeners for warp evaluation progress
  useEffect(() => {
    evaluationProgessEmitter.on('progress-notification', tickProgress);
    return () => {
      evaluationProgessEmitter.off('progress-notification', tickProgress);
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

  function tickProgress({ message }: { message: string }) {
    const { currentInteractionNumber, totalInteractionCount } =
      parseProgressMessage(message);
    const percentage =
      (Math.max(1, currentInteractionNumber) / totalInteractionCount) * 100;
    console.log(percentage, message);
    if (percentage >= 100) {
      return setEvaluationProgress(undefined);
    }
    return setEvaluationProgress(Math.round(percentage));
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
            <span style={{ fontSize: '16px' }}>Evaluating contract</span>
            <span style={{ fontSize: '14px' }}>{evaluationProgress ?? 0}%</span>
          </div>
        }
      />
    </>
  );
}

export default WarpEvaluationProgress;
