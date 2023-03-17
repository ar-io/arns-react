import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ANTContractJSON, ArweaveTransactionID } from '../../../types';
import {
  DEFAULT_ANT_SOURCE_CODE_TX,
  NAME_PRICE_INFO,
  SMARTWEAVE_TAG_SIZE,
} from '../../../utils/constants';
import { AntCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import Loader from '../Loader/Loader';
import { Tooltip } from '../Tooltip/Tooltip';
import './styles.css';

function ConfirmRegistration() {
  const [
    { domain, antContract, tier, leaseDuration, antID, fee, stage },
    dispatchRegistrationState,
  ] = useRegistrationState();
  const [{ arnsContractId, arweaveDataProvider }] = useGlobalState();
  const [isPostingTransaction, setIsPostingTransaction] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  async function buyArnsName() {
    setIsPostingTransaction(true);

    if (!antContract) {
      throw Error('No ant contract state present');
    }
    if (!domain) {
      throw new Error('No domain provided for registration');
    }

    const pendingTXId = antID
      ? await arweaveDataProvider.writeTransaction(arnsContractId, {
          function: 'buyRecord',
          name: domain,
          contractTransactionId: antID.toString(),
        })
      : await arweaveDataProvider.registerAtomicName({
          srcCodeTransactionId: new ArweaveTransactionID(
            DEFAULT_ANT_SOURCE_CODE_TX,
          ),
          initialState: antContract.state,
          domain,
        });
    if (pendingTXId) {
      dispatchRegistrationState({
        type: 'setResolvedTx',
        payload: new ArweaveTransactionID(pendingTXId.toString()),
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
              id={antID ?? undefined}
              state={antContract?.state ?? undefined}
              compact={false}
              enableActions={false}
              overrides={{
                tier,
                ttlSeconds: antContract?.records['@'].ttlSeconds,
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
            <div className="flex flex-column center" style={{ gap: '0.2em' }}>
              <Tooltip message={NAME_PRICE_INFO}>
                <span className="white bold text-small">
                  {fee.io?.toLocaleString()}&nbsp;IO&nbsp;+&nbsp;
                  <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
                </span>
              </Tooltip>
              <span className="text faded">Estimated Price</span>
            </div>
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
