import { ANTContractJSON, ArweaveTransactionID } from '../../../types';
import { AntCard } from '../../cards';

export enum transaction_types {
  TRANSFER_ANT = 'Transfer ANT Token',
  EDIT_ANT = 'Edit ANT Token',
  CREATE_UNDERNAME = 'Create Under_Name',
  CREATE_ANT = 'Create ANT Token',
  TRANSFER_IO = 'Transfer IO Token',
  BUY_ARNS_NAME = 'Buy ArNS Name',
}

function TransactionSuccess({
  transactionId = new ArweaveTransactionID(
    '-------default-arweave-transaction-id------',
  ),
  state,
}: {
  transactionId?: ArweaveTransactionID;
  state: ANTContractJSON;
}) {
  return (
    <>
      <div className="flex-column center" style={{ gap: '3em' }}>
        <div className="flex-column center" style={{ gap: '1em' }}></div>
        <AntCard
          domain={''}
          id={transactionId}
          state={state}
          compact={true}
          enableActions={false}
          overrides={{
            tier: 1,
            ttlSeconds: state.records['@'].ttlSeconds,
            maxSubdomains: state.records['@'].maxSubdomains,
            leaseDuration: `N/A`,
          }}
        />
      </div>
    </>
  );
}

export default TransactionSuccess;
