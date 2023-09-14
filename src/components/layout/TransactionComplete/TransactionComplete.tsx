import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  PDNSMapping,
  TransactionData,
  ValidInteractionType,
} from '../../../types';
import eventEmitter from '../../../utils/events';
import {
  getLinkId,
  getPDNSMappingByInteractionType,
} from '../../../utils/transactionUtils/transactionUtils';
import { PDNTCard } from '../../cards';
import { ArrowLeft, SettingsIcon } from '../../icons';
import PageLoader from '../progress/PageLoader/PageLoader';
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
  const [{ deployedTransactionId }, dispatchTransactionState] =
    useTransactionState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [pdntProps, setPdntProps] = useState<PDNSMapping>();

  useEffect(() => {
    if (transactionId && transactionId === deployedTransactionId) {
      onLoad();
    }
  }, [transactionId]);

  function onLoad() {
    try {
      setLoading(true);
      // reset transaction state upon succesfull deployment
      if (!transactionId) {
        throw new Error('Unable to set ANT properties.');
      }
      setPdntProps(
        getPDNSMappingByInteractionType({
          interactionType,
          transactionData: {
            ...transactionData,
            deployedTransactionId: transactionId,
          },
        }),
      );
      dispatchTransactionState({
        type: 'setDeployedTransactionId',
        payload: undefined,
      });
      dispatchTransactionState({
        type: 'setInteractionType',
        payload: undefined,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  if (!pdntProps) {
    return <PageLoader loading={loading} />;
  }

  return (
    <div className="flex-column center" style={{ gap: '20px', width: '700px' }}>
      <div className="flex-column center" style={{ gap: '20px' }}>
        <div
          className="flex flex-row center"
          style={{
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            gap: '20px',
          }}
        >
          <ActionCard
            to={`/manage/ants/${getLinkId(interactionType, {
              ...transactionData,
              deployedTransactionId: transactionId,
            }).trim()}`}
            body={
              <div className="flex flex-column center" style={{ gap: '15px' }}>
                <SettingsIcon width={'20px'} fill={'var(--text-grey)'} />
                Configure Domain
              </div>
            }
          />
          <ActionCard
            to={`/manage/ants/${getLinkId(interactionType, {
              ...transactionData,
              deployedTransactionId: transactionId,
            }).trim()}/undernames`}
            body={
              <div className="flex flex-column center" style={{ gap: '15px' }}>
                <PlusOutlined
                  style={{ color: 'var(--text-grey)', fontSize: '20px' }}
                />
                Add Undernames
              </div>
            }
          />
        </div>
        <PDNTCard
          {...pdntProps}
          overrides={{
            ...pdntProps.overrides,
          }}
          compact={false}
        />
        <div
          className="flex flex-row center"
          style={{
            justifyContent: 'flex-start',
          }}
        >
          <button
            className="flex button hover center white"
            onClick={() => navigate('/manage')}
            style={{ gap: '10px' }}
          >
            <ArrowLeft width={'20px'} fill={'var(--text-grey)'} />
            Back to Manage Assets
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionComplete;
