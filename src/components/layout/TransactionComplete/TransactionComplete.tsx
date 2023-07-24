import { PlusOutlined } from '@ant-design/icons';
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
import { CodeSandboxIcon, SettingsIcon } from '../../icons';
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
            to={`/manage/ants`}
            body={
              <div className="flex flex-column center" style={{ gap: '15px' }}>
                <CodeSandboxIcon width={'20px'} fill={'var(--text-grey)'} />
                Create ANTs
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
