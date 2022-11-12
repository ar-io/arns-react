import { TIER_DATA } from '../../../../types/constants';
import { TierCardProps } from '../../../types';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tier, setTier, thisTier }: TierCardProps) {
  return (
    <div className="tierCard">
      <div className="text bubbleSmall">Tier&nbsp;{thisTier}</div>

      {TIER_DATA[thisTier].map((info: string) => (
        <span className="text white bold">
          <CircleCheck
            width="16px"
            height={'16px'}
            fill="var(--success-green)"
          />
          &nbsp;{info}
        </span>
      ))}

      {thisTier !== tier ? (
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
