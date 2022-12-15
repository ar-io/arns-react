import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { TierCardProps } from '../../../types';
import { TIER_DATA } from '../../../utils/constants';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ currentTier }: TierCardProps) {
  const [{ tier }, dispatchRegisterState] = useRegistrationState();
  return (
    <div className="tier-card hover">
      <div className="text bubble-small ">Tier&nbsp;{currentTier}</div>

      {TIER_DATA[currentTier].map((info: string, index: number) => (
        <span className="text white bold" key={index}>
          <CircleCheck
            width="16px"
            height={'16px'}
            fill="var(--success-green)"
          />
          &nbsp;{info}
        </span>
      ))}

      {currentTier !== tier ? (
        <button
          className="select-button"
          onClick={() =>
            dispatchRegisterState({ type: 'setTier', payload: currentTier })
          }
        >
          Select
        </button>
      ) : (
        <button className="selected-button">Selected</button>
      )}
    </div>
  );
}

export default TierCard;
