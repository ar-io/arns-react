import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { TierCardProps } from '../../../types';
import { TIER_DATA } from '../../../utils/constants';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tierNumber }: TierCardProps) {
  const [{ tier }, dispatchRegisterState] = useRegistrationState();
  return (
    <div className="tier-card hover">
      <div className="text bubble-small ">Tier&nbsp;{tierNumber}</div>

      {TIER_DATA[tierNumber].map((info: string, index: number) => (
        <span className="text white bold" key={index}>
          <CircleCheck
            width="16px"
            height={'16px'}
            fill="var(--success-green)"
          />
          &nbsp;{info}
        </span>
      ))}

      {tierNumber !== tier ? (
        <button
          className="select-button"
          onClick={() =>
            dispatchRegisterState({ type: 'setTier', payload: tierNumber })
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
