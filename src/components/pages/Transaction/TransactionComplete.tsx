import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ARNSMapping,
  TransactionData,
  ValidInteractionType,
} from '../../../types';
import {
  getARNSMappingByInteractionType,
  getLinkId,
} from '../../../utils/transactionUtils/transactionUtils';
import { ANTCard } from '../../cards';
import ActionCard from '../../cards/ActionCard/ActionCard';
import { ArrowLeft, SettingsIcon } from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';

function TransactionComplete() {
  const [
    { interactionResult, interactionType, workflowName, transactionData },
    dispatchTransactionState,
  ] = useTransactionState();
  const navigate = useNavigate();

  const [antProps, setAntProps] = useState<ARNSMapping>();
  const [localData, setLocalData] = useState<any>();

  useEffect(() => {
    if (!antProps) {
      setLocalData({
        transactionData,
        interactionType,
        interactionResult,
      });
      setAntProps(
        getARNSMappingByInteractionType({
          interactionType: interactionType as ValidInteractionType,
          transactionData: {
            ...transactionData,
            deployedTransactionId: interactionResult?.id,
          } as TransactionData,
        }) as ARNSMapping,
      );
    } else {
      dispatchTransactionState({
        type: 'reset',
      });
    }
  }, [antProps]);

  if (!antProps || !localData) {
    return <PageLoader loading={true} message={'Loading...'} />;
  }

  const link = getLinkId(workflowName as ValidInteractionType, {
    ...localData.transactionData,
    deployedTransactionId: localData.interactionResult.id,
  }).trim();

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
            to={`/manage/ants/${link}`}
            body={
              <div className="flex flex-column center" style={{ gap: '15px' }}>
                <SettingsIcon width={'20px'} fill={'var(--text-grey)'} />
                Configure Domain
              </div>
            }
          />
          <ActionCard
            to={`/manage/ants/${link}/undernames`}
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
        <ANTCard
          {...antProps}
          overrides={{
            ...antProps.overrides,
          }}
          compact={false}
          bordered
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
