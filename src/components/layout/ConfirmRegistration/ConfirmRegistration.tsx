import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { NAME_PRICE_INFO, SMARTWEAVE_TAG_SIZE } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { PDNTCard } from '../../cards';
import ArPrice from '../ArPrice/ArPrice';
import Loader from '../Loader/Loader';
import { Tooltip } from '../Tooltip/Tooltip';
import './styles.css';

function ConfirmRegistration() {
  const [
    { domain, ttl, tier, leaseDuration, pdntID, fee, stage },
    dispatchRegistrationState,
  ] = useRegistrationState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsSourceContract, pdnsContractId }] = useGlobalState();
  const [isPostingTransaction, setIsPostingTransaction] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  useEffect(() => {
    if (!pdntID) {
      return;
    }
    // TODO: probably no longer necessary since we do the validations before rendering this component
    arweaveDataProvider
      .validateTransactionTags({
        id: pdntID.toString(),
        requiredTags: {
          'Contract-Src': pdnsSourceContract.approvedANTSourceCodeTxs,
        },
      })
      .then(() => {
        setIsConfirmed(true);
      })
      .catch((error: Error) => {
        eventEmitter.emit('error', error);
        setIsConfirmed(false);
      });
  }, [pdntID, pdnsContractId]);

  async function buyPDNSName() {
    try {
      setIsPostingTransaction(true);
      if (!pdntID) {
        return;
      }
      const pendingTXId = await arweaveDataProvider.writeTransaction(
        pdnsContractId,
        {
          function: 'buyRecord',
          name: domain,
          contractTxId: pdntID.toString(),
        },
      );
      if (pendingTXId) {
        dispatchRegistrationState({
          type: 'setResolvedTx',
          payload: pendingTXId,
        });
        console.log(`Posted transaction: ${pendingTXId}`);
      }
      // TODO: write to local storage to store pending transactions
      dispatchRegistrationState({
        type: 'setStage',
        payload: stage + 1,
      });
    } catch (error: any) {
      eventEmitter.emit('error', error);
    } finally {
      setIsPostingTransaction(false);
    }
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
            <PDNTCard
              domain={domain ?? ''}
              id={pdntID ? pdntID : undefined}
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
          <span className="h2 error">Something went wrong!</span>
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
                disabled={!pdntID || !isConfirmed}
                onClick={() => {
                  buyPDNSName();
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
