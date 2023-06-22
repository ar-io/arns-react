import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTransactionData } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
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
  const location = useLocation();
  const [, dispatchTransactionState] = useTransactionState();
  const pdntProps = getPDNSMappingByInteractionType({
    interactionType,
    transactionData,
  });

  // useEffect(() => {
  //  dispatchTransactionState({
  //   type:"reset"
  //  })
  // }, [location.pathname]);

  if (!pdntProps) {
    eventEmitter.emit('error', new Error('Unable to set PDNT properties.'));
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
            to={`/manage/pdnts/${getLinkId(interactionType, {
              ...transactionData,
              deployedTransactionId: transactionId,
            }).trim()}`}
            body={' Manage PDNT'}
          />

          <ActionCard
            to={`/manage/pdnts/${getLinkId(interactionType, {
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
            deployedTransactionId: transactionId?.toString(),
          }}
          compact={false}
        />
      </div>
    </div>
  );
}

export default TransactionComplete;
