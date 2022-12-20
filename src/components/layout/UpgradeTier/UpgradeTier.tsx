import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  NAME_PRICE_INFO,
  TIER_DATA,
} from '../../../utils/constants';
import { calculateArNSNamePrice } from '../../../utils/searchUtils';
import TierCard from '../../cards/TierCard/TierCard';
import { AlertCircle } from '../../icons';
import Counter from '../../inputs/Counter/Counter';
import './styles.css';

function UpgradeTier({ domain }: { domain?: string }) {
  const [{ arnsSourceContract }, dispatch] = useGlobalState();
  // name is passed down from search bar to calculate price
  const [selectedTier, setSelectedTier] = useState(1);
  const [price, setPrice] = useState<number | undefined>(0);
  const [years, setYears] = useState(MIN_LEASE_DURATION);
  const [priceInfo, setPriceInfo] = useState(false);

  const { wallet, walletAddress } = useWalletAddress();

  useEffect(() => {
    const fees = arnsSourceContract.fees;
    setPrice(calculateArNSNamePrice({ domain, selectedTier, years, fees }));
  }, [years, selectedTier, domain, arnsSourceContract]);

  function showConnectWallet() {
    dispatch({
      type: 'setShowConnectWallet',
      payload: true,
    });
  }

  return (
    <div className="upgrade-tier">
      <Counter
        setCount={setYears}
        count={years}
        period="years"
        minValue={MIN_LEASE_DURATION}
        maxValue={MAX_LEASE_DURATION}
      />
      <div className="card-container">
        {Object.keys(TIER_DATA).map((tier, index: number) => (
          <TierCard
            tier={+tier}
            setTier={setSelectedTier}
            selectedTier={selectedTier}
            key={index}
          />
        ))}
      </div>
      <button
        className="section-header tool-tip"
        onClick={() => {
          setPriceInfo(!priceInfo);
        }}
      >
        {price?.toLocaleString()}&nbsp;ARIO&nbsp;
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
      {!walletAddress || !wallet ? (
        <button className="accent-button hover" onClick={showConnectWallet}>
          Connect Wallet to proceed
        </button>
      ) : (
        <button className="accent-button">Next</button>
      )}
    </div>
  );
}

export default UpgradeTier;
