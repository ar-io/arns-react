import { TierCardProps } from '../../../types';
import { TIER_DATA } from '../../../utils/constants';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tier, setTier, selectedTier }: TierCardProps) {
  return (
    <div className="tierCard">
      <div className="text bubbleSmall">Tier&nbsp;{tier}</div>

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
        <button className="selectButton" onClick={() => setTier(tier)}>
          Select
        </button>
      ) : (
        <button className="selectedButton">Selected</button>
      )}
    </div>
  );
}

export default TierCard;
