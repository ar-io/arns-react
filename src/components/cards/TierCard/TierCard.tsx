import { useEffect, useState } from 'react';

import { TIER_DATA } from '../../../../types/constants';
import { TierCardProps } from '../../../types';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tier, setTier, selectedTier }: TierCardProps) {
  const [thisTier, setThisTier] = useState(new Number(tier).valueOf());

  useEffect(() => {
    setThisTier(new Number(tier).valueOf());
  }, [tier, selectedTier]);

  return (
    <div className="tierCard">
      <div className="text bubbleSmall">Tier&nbsp;{thisTier}</div>

      {TIER_DATA[thisTier].map((info: string, index: number) => (
        <span className="text white bold" key={index}>
          <CircleCheck
            width="16px"
            height={'16px'}
            fill="var(--success-green)"
          />
          &nbsp;{info}
        </span>
      ))}

      {selectedTier !== thisTier ? (
        <button className="selectButton" onClick={() => setTier(thisTier)}>
          Select
        </button>
      ) : (
        <button className="selectedButton">Selected</button>
      )}
    </div>
  );
}

export default TierCard;
