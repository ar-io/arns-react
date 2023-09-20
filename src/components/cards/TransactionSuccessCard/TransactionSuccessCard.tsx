import { useEffect, useRef } from 'react';

import { ArweaveTransactionID } from '../../../types';
import { CircleCheckFilled, CloseIcon } from '../../icons';
import ArweaveID from '../../layout/ArweaveID/ArweaveID';

function TransactionSuccessCard({
  txId,
  title,
  close,
}: {
  txId: ArweaveTransactionID;
  close: () => void;
  title?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [txId]);

  return (
    <div
      ref={cardRef}
      className="flex flex-row add-box center fade-in"
      style={{
        padding: '20px',
        gap: '20px',
        border: '2px solid var(--success-green)',
        boxSizing: 'border-box',
      }}
    >
      <CircleCheckFilled
        width={'20px'}
        height={'20px'}
        fill={'var(--success-green)'}
      />
      <div
        className="flex-column"
        style={{
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '5px',
          fontSize: '16px',
        }}
      >
        <span className="white">{title ?? 'Transaction Complete'}</span>
        <ArweaveID
          id={txId}
          shouldLink={true}
          copyButtonStyle={{ display: 'none' }}
        />
      </div>

      <button className="button flex center pointer" onClick={() => close()}>
        <CloseIcon width={'20px'} height={'20px'} fill="white" />
      </button>
    </div>
  );
}

export default TransactionSuccessCard;
