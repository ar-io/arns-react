import DomainSettings, {
  DomainSettingsRowTypes,
} from '@src/components/forms/DomainSettings/DomainSettings';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import TransactionSuccessCard from '../../cards/TransactionSuccessCard/TransactionSuccessCard';
import { CodeSandboxIcon } from '../../icons';
import './styles.css';

function ManageANT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, data } = useDomainInfo({
    antId: id,
    domain: '',
  });

  const [{ interactionResult, workflowName }, dispatchTransactionState] =
    useTransactionState();

  useEffect(() => {
    // removes banner from page by calling rest
    return () => {
      dispatchTransactionState({ type: 'reset' });
    };
  }, []);

  useEffect(() => {
    if (!id) {
      navigate('/manage/ants');
      return;
    }

    // fetch all relevant ant information
  }, [id]);

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <div
        className="page"
        style={{ gap: '0px', paddingTop: '10px', paddingBottom: '10px' }}
      >
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
            {data?.name ?? id}
          </h2>
        </div>
        <div className="flex-row">
          <DomainSettings
            antId={id}
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
