import { TierCardProps } from '../../../types';
import { TIER_DATA } from '../../../utils/constants';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tier, setTier, selectedTier }: TierCardProps) {
  return (
    <div className="tier-card hover">
      <div className="text bubble-small ">Tier&nbsp;{tier}</div>

      {TIER_DATA[tier].map((info: string, index: number) => (
        <span className="text white bold" key={index}>
          <CircleCheck
            width="16px"
            height={'16px'}
            fill="var(--success-green)"
          />
          &nbsp;{info}
        </span>
      ))}

      {selectedTier !== tier ? (
        <button className="select-button" onClick={() => setTier(tier)}>
          Select
        </button>
      ) : (
        <button className="selected-button">Selected</button>
      )}
    </div>
  );
}

export default TierCard;
