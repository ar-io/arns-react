import { useEffect, useState } from 'react';

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
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import './styles.css';

function UpgradeTier() {
  const [{ arnsSourceContract, walletAddress, jwk }, dispatch] =
    useGlobalState();
  // name is passed down from search bar to calculate price
  const [priceInfo, setPriceInfo] = useState(false);

  const [
    {
      fee,
      leaseDuration,
      chosenTier,
      domain,
      stage,
      isFirstStage,
      isLastStage,
    },
    dispatchRegisterState,
  ] = useRegistrationState();

  useEffect(() => {
    const fees = arnsSourceContract.fees;
    const newFee = calculateArNSNamePrice({
      domain,
      selectedTier: chosenTier,
      years: leaseDuration,
      fees,
    });
    dispatchRegisterState({
      type: 'setFee',
      payload: { ar: fee.ar, io: newFee },
    });
  }, [leaseDuration, chosenTier, domain, arnsSourceContract]);

  function showConnectWallet() {
    dispatch({
      type: 'setConnectWallet',
      payload: true,
    });
  }

  return (
    <div className="upgradeTier">
      <Counter
        period="years"
        minValue={MIN_LEASE_DURATION}
        maxValue={MAX_LEASE_DURATION}
      />
      <div className="cardContainer">
        {Object.keys(TIER_DATA).map((tier, index: number) => (
          <TierCard tier={+tier} key={index} />
        ))}
      </div>
      <button
        className="sectionHeader toolTip"
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
      {!walletAddress && !jwk ? (
        <button className="accentButton hover" onClick={showConnectWallet}>
          Connect Wallet to proceed
        </button>
      ) : (
        <WorkflowButtons
          stage={stage}
          isFirstStage={isFirstStage}
          isLastStage={isLastStage}
          dispatch={dispatchRegisterState}
          showBack={true}
          showNext={true}
        />
      )}
    </div>
  );
}

export default UpgradeTier;
