import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
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

function UpgradeTier() {
  const [{ arnsSourceContract }] = useGlobalState();
  // name is passed down from search bar to calculate price
  const [priceInfo, setPriceInfo] = useState(false);
  const [{ fee, leaseDuration, tier, domain }, dispatchRegisterState] =
    useRegistrationState();

  useEffect(() => {
    const fees = arnsSourceContract.fees;
    const newFee = calculateArNSNamePrice({
      domain,
      selectedTier: tier,
      years: leaseDuration,
      fees,
    });
    dispatchRegisterState({
      type: 'setFee',
      payload: { ar: fee.ar, io: newFee },
    });
  }, [leaseDuration, tier, domain, arnsSourceContract]);

  return (
    <div className="upgrade-tier">
      <Counter
        period="years"
        minValue={MIN_LEASE_DURATION}
        maxValue={MAX_LEASE_DURATION}
      />
      <div className="card-container">
        {Object.keys(TIER_DATA).map((tier, index: number) => (
          <TierCard tierNumber={+tier} key={index} />
        ))}
      </div>
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
    </div>
  );
}

export default UpgradeTier;
