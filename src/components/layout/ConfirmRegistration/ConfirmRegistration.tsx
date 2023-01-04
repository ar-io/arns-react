import { useState } from 'react';

import { defaultDataProvider } from '../../../services/arweave';
import { useGlobalState } from '../../../state/contexts/GlobalState.js';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { AntCard } from '../../cards/index.js';
import { AlertCircle } from '../../icons';
import Loader from '../Loader/Loader.js';
import './styles.css';

function ConfirmRegistration() {
  const [
    { domain, ttl, tier, leaseDuration, antID, fee, stage },
    dispatchRegistrationState,
  ] = useRegistrationState();
  const [{}, dispatchGlobalState] = useGlobalState();
  const [priceInfo, setPriceInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      dispatchGlobalState({
        type: 'pushNotification',
        payload: `Successfully posted transaction: ${pendingTXId}`,
      });
      console.log(`Posted transaction: ${pendingTXId}`);
    }
    // wait a bit, then navigate to next page
    setTimeout(() => {
      setIsLoading(false);
      dispatchRegistrationState({
        type: 'setStage',
        payload: stage + 1,
      });
    }, 1000);
  }

  return (
    <>
      <div className="register-name-modal center">
        <span className="section-header">Confirm Domain Registration</span>
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
        <span className="text faded underline" style={{ maxWidth: '475px' }}>
          You will sign two (2) transactions, a registration fee (paid in ARIO
          tokens) and the Arweave network fee (paid in AR).
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
              <span className="text bold black center">{NAME_PRICE_INFO}</span>
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
        {isLoading ? (
          <Loader size={40} />
        ) : (
          <button
            className="accent-button"
            disabled={!antID}
            onClick={() => {
              buyArnsName();
            }}
          >
            Confirm
          </button>
        )}
      </div>
    </>
  );
}

export default ConfirmRegistration;
