import DomainSettings, {
  DomainSettingsRowTypes,
} from '@src/components/forms/DomainSettings/DomainSettings';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useWalletState } from '../../../state/contexts/WalletState';
import TransactionSuccessCard from '../../cards/TransactionSuccessCard/TransactionSuccessCard';
import { CodeSandboxIcon } from '../../icons';
import './styles.css';

function ManageANT() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();

  const { data } = useDomainInfo({ antId: new ArweaveTransactionID(id) });

  const [{ interactionResult, workflowName }, dispatchTransactionState] =
    useTransactionState();

  useEffect(() => {
    if (!id || !walletAddress) {
      navigate('/manage/ants');
      return;
    }
  }, [id]);

  return (
    <>
      <div className="page" style={{ gap: '30px' }}>
        {interactionResult ? (
          <TransactionSuccessCard
            txId={new ArweaveTransactionID(interactionResult.id)}
            title={`${workflowName} completed`}
            close={() => {
              dispatchTransactionState({
                type: 'reset',
              });
            }}
          />
        ) : (
          <></>
        )}
        <div className="flex-row flex-space-between">
          <h2 className="flex white center" style={{ gap: '15px' }}>
            <CodeSandboxIcon
              width={'24px'}
              height={'24px'}
              fill="var(--text-white)"
            />
            {data.antState?.name ?? id}
          </h2>
        </div>
        <div className="flex-row">
          <DomainSettings
            antId={new ArweaveTransactionID(id)}
            rowFilter={[
              DomainSettingsRowTypes.EXPIRY_DATE,
              DomainSettingsRowTypes.LEASE_DURATION,
              DomainSettingsRowTypes.ASSOCIATED_NAMES,
            ]}
          />
        </div>
      </div>
    </>
  );
}

export default ManageANT;
