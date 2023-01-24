import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { AntCard } from '../../cards';
import Loader from '../Loader/Loader';
import { Tooltip } from '../Tooltip/Tooltip';
import './styles.css';

function ConfirmRegistration() {
  const [
    { domain, ttl, tier, leaseDuration, antID, fee, stage },
    dispatchRegistrationState,
  ] = useRegistrationState();
  const [{ arnsSourceContract, arnsContractId, arweaveDataProvider }] =
    useGlobalState();
  const [isPostingTransaction, setIsPostingTransaction] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!antID) {
      return;
    }
    arweaveDataProvider
      .validateTransactionTags({
        id: antID,
        requiredTags: {
          'Contract-Src': arnsSourceContract.approvedANTSourceCodeTxs,
        },
      })
      .then(() => {
        setIsConfirmed(true);
      })
      .catch((e: Error) => {
        // TODO: push error notification
        console.error(e);
        setIsConfirmed(false);
        setErrorMessage(e.message);
      });
  }, [antID, arnsContractId]);

  async function buyArnsName() {
    setIsPostingTransaction(true);
    if (!antID) {
      return;
    }
    const pendingTXId = await arweaveDataProvider.writeTransaction(
      arnsContractId,
      {
        function: 'buyRecord',
        name: domain,
        contractTransactionId: antID,
      },
    );
    if (pendingTXId) {
      dispatchRegistrationState({
        type: 'setResolvedTx',
        payload: pendingTXId,
      });
      console.log(`Posted transaction: ${pendingTXId}`);
    }
    setTimeout(() => {
      setIsPostingTransaction(false);
      // TODO: write to local storage to store pending transactions
      dispatchRegistrationState({
        type: 'setStage',
        payload: stage + 1,
      });
    }, 500);
  }

  return (
    <>
      <div className="register-name-modal center">
        {!isPostingTransaction ? (
          <span className="text-large white">
            {domain}.arweave.net is available!
          </span>
        ) : (
          <></>
        )}
        <div className="section-header">Confirm Domain Registration</div>
        {isPostingTransaction ? (
          <Loader size={80} />
        ) : isConfirmed ? (
          <>
            <AntCard
              domain={domain ?? ''}
              id={antID ? antID : undefined}
              compact={false}
              enableActions={false}
              overrides={{
                tier,
                ttlSeconds: ttl,
                maxSubdomains: 100,
                leaseDuration: `${leaseDuration} year`,
              }}
            />
            <span
              className="text faded underline"
              style={{ maxWidth: '475px' }}
            >
              You will sign a single transaction to register this domain.
            </span>
            <Tooltip message={NAME_PRICE_INFO}>
              <span>{fee.io?.toLocaleString()}&nbsp;ARIO&nbsp;</span>
            </Tooltip>
          </>
        ) : (
          <span className="h2 error">{errorMessage}</span>
        )}
        {!isPostingTransaction ? (
          <div className="flex-row center">
            <button
              className="outline-button"
              onClick={() => {
                dispatchRegistrationState({
                  type: 'setStage',
                  payload: stage - 1,
                });
              }}
            >
              Back
            </button>
            {isConfirmed ? (
              <button
                className="accent-button"
                disabled={!antID || !isConfirmed}
                onClick={() => {
                  buyArnsName();
                }}
              >
                Confirm
              </button>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default ConfirmRegistration;
