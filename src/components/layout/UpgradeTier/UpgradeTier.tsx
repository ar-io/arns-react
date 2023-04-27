import { useEffect } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  NAME_PRICE_INFO,
  SMARTWEAVE_TAG_SIZE,
  TIER_DATA,
} from '../../../utils/constants';
import { calculatePdnsNamePrice } from '../../../utils/searchUtils/searchUtils';
import TierCard from '../../cards/TierCard/TierCard';
import Counter from '../../inputs/Counter/Counter';
import ArPrice from '../ArPrice/ArPrice';
import { Tooltip } from '../Tooltip/Tooltip';
import './styles.css';

function UpgradeTier() {
  const [{ pdnsSourceContract }] = useGlobalState();
  const [{ fee, leaseDuration, tier, domain }, dispatchRegisterState] =
    useRegistrationState();

  useEffect(() => {
    const fees = pdnsSourceContract.fees;
    if (domain) {
      const newFee = calculatePdnsNamePrice({
        domain,
        selectedTier: tier,
        years: leaseDuration,
        fees,
      });
      dispatchRegisterState({
        type: 'setFee',
        payload: { ar: fee.ar, io: newFee },
      });
    }
  }, [leaseDuration, tier, domain, pdnsSourceContract]);

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
      <div className="flex flex-column center" style={{ gap: '0.2em' }}>
        <Tooltip message={NAME_PRICE_INFO}>
          <span className="text-large white bold center">
            {fee.io?.toLocaleString()}&nbsp;IO&nbsp;+&nbsp;
            <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
          </span>
        </Tooltip>
        <span className="text faded">Estimated Price</span>
      </div>
    </div>
  );
}

export default UpgradeTier;
