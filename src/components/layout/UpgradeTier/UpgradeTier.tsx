import { useEffect, useState } from 'react';

import { NAME_PRICE_CALC, NAME_PRICE_INFO } from '../../../../types/constants';
import TierCard from '../../cards/TierCard/TierCard';
import { AlertCircle } from '../../icons';
import YearsCounter from '../../inputs/YearsCounter/YearsCounter';
import './styles.css';

function UpgradeTier({ domain }: { domain: string | undefined }) {
  // name is passed down from search bar to calculate price
  const [tier, setTier] = useState(1);
  const [price, setPrice] = useState(0);
  const [years, setYears] = useState(1);
  const [priceInfo, setPriceInfo] = useState(false);

  useEffect(() => {
    setPrice(NAME_PRICE_CALC({ domain, tier, years }));
  }, [years, tier, domain]);

  return (
    <div className="upgradeTier">
      <YearsCounter setCount={setYears} count={years} />
      <div className="cardContainer">
        <TierCard thisTier={1} setTier={setTier} tier={tier} />
        <TierCard thisTier={2} setTier={setTier} tier={tier} />
        <TierCard thisTier={3} setTier={setTier} tier={tier} />
      </div>
      <button
        className="sectionHeader toolTip"
        onClick={() => {
          setPriceInfo(!priceInfo);
        }}
      >
        {price}&nbsp;ARIO&nbsp;
        <AlertCircle
          width={'16px'}
          height={'16px'}
          fill={'var(--text-white)'}
        />
        {priceInfo ? (
          <span className="infoBubble">
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
