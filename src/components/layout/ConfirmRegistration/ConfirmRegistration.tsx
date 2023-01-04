import { useEffect, useState } from 'react';

import { defaultDataProvider } from '../../../services/arweave';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { isAntValid } from '../../../utils/searchUtils';
import { AntCard } from '../../cards';
import { AlertCircle } from '../../icons';
import Loader from '../Loader/Loader';
import './styles.css';

function ConfirmRegistration() {
  const [
    { domain, ttl, tier, leaseDuration, antID, fee, stage },
    dispatchRegistrationState,
  ] = useRegistrationState();
  const [{ arnsSourceContract }] = useGlobalState(); // eslint-disable-line
  const [priceInfo, setPriceInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!antID) {
      return;
    }
    isAntValid(antID, arnsSourceContract.approvedANTSourceCodeTxs)
      .then((isValid) => {
        setIsConfirmed(isValid);
      })
      .catch((e: Error) => {
        // TODO: push error notification
        console.error(e);
        setIsConfirmed(false);
        setErrorMessage(e.message);
      });
  }, [antID]);

  async function buyArnsName() {
    setIsLoading(true);
    if (!antID) {
      return;
    }
    const dataProvider = defaultDataProvider();
    const pendingTXId = await dataProvider.writeTransaction({
      function: 'buyRecord',
      name: domain,
      contractTransactionId: antID,
    });
    if (pendingTXId) {
      dispatchRegistrationState({
        type: 'setResolvedTx',
        payload: pendingTXId,
      });
      console.log(`Posted transaction: ${pendingTXId}`);
    }
    setTimeout(() => {
      setIsLoading(false);
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
        {!isLoading ? (
          <span className="text-large white">
            {domain}.arweave.net is available!
          </span>
        ) : (
          <></>
        )}
        <div className="section-header">Confirm Domain Registration</div>
        {isLoading ? (
          <Loader size={80} />
        ) : isConfirmed ? (
          <>
            <AntCard
              domain={domain}
              id={antID ?? ''}
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
              You will sign two (2) transactions, a registration fee (paid in
              ARIO tokens) and the Arweave network fee (paid in AR).
            </span>
            <button
              className="section-header tool-tip"
              onClick={() => {
                setPriceInfo(!priceInfo);
              }}
            >
              {fee.io?.toLocaleString()}&nbsp;ARIO&nbsp;
              <AlertCircle
                width={'16px'}
                height={'16px'}
                fill={'var(--text-white)'}
              />
              {priceInfo ? (
                <span className="info-bubble">
                  <span className="text bold black center">
                    {NAME_PRICE_INFO}
                  </span>
                  {/**TODO: link to faq or about page */}
                  <a
                    href="https://ar.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="text faded underline bold center"
                  >
                    Need help choosing a tier?
                  </a>
                </span>
              ) : (
                <></>
              )}
            </button>
          </>
        ) : (
          <span className="h2 error">{errorMessage}</span>
        )}
        {!isLoading ? (
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
