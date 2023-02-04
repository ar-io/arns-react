import { useEffect } from 'react';

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
import Counter from '../../inputs/Counter/Counter';
import { Tooltip } from '../Tooltip/Tooltip';
import './styles.css';

function UpgradeTier() {
  const [{ arnsSourceContract }] = useGlobalState();
  const [{ fee, leaseDuration, tier, domain }, dispatchRegisterState] =
    useRegistrationState();

  useEffect(() => {
    const fees = arnsSourceContract.fees;
    if (domain) {
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
    }
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
      <Tooltip message={[<>{NAME_PRICE_INFO}</>]}>
        <span>{fee.io?.toLocaleString()}&nbsp;ARIO&nbsp;</span>
      </Tooltip>{' '}
    </div>
  );
}

export default UpgradeTier;
