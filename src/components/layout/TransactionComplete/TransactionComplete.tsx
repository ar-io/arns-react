import { useNavigate } from 'react-router-dom';

import {
  ArweaveTransactionID,
  TransactionData,
  ValidInteractionType,
} from '../../../types';
import eventEmitter from '../../../utils/events';
import {
  getLinkId,
  getPDNSMappingByInteractionType,
} from '../../../utils/transactionUtils/transactionUtils';
import { PDNTCard } from '../../cards';
import ActionCard from './ActionCard';

function TransactionComplete({
  transactionId,
  interactionType,
  transactionData,
}: {
  transactionId?: ArweaveTransactionID;
  interactionType: ValidInteractionType;
  transactionData: TransactionData;
}) {
  const navigate = useNavigate();
  const pdntProps = getPDNSMappingByInteractionType({
    interactionType,
    transactionData: {
      ...transactionData,
      deployedTransactionId: transactionId,
    },
  });

  if (!pdntProps) {
    eventEmitter.emit('error', new Error('Unable to set ANT properties.'));
    navigate(-1);
    return <></>;
  }

  return (
    <div className="flex-column center" style={{ gap: '3em', width: '700px' }}>
      <div className="flex-column center">
        <div
          className="flex flex-row center"
          style={{
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <ActionCard to={'/'} body={'Register a Name'} />

          <ActionCard
            to={`/manage/ants/${getLinkId(interactionType, {
              ...transactionData,
              deployedTransactionId: transactionId,
            }).trim()}`}
            body={' Manage ANT'}
          />

          <ActionCard
            to={`/manage/ants/${getLinkId(interactionType, {
              ...transactionData,
              deployedTransactionId: transactionId,
            }).trim()}/undernames`}
            body={'Add Undernames'}
          />
        </div>
        {/* TODO: configure error or fail states */}
        <PDNTCard
          {...pdntProps}
          overrides={{
            ...pdntProps.overrides,
          }}
          compact={false}
        />
      </div>
    </div>
  );
}

export default TransactionComplete;
