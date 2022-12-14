import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { TierCardProps } from '../../../types';
import { TIER_DATA } from '../../../utils/constants';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tier }: TierCardProps) {
  const [{ chosenTier }, dispatchRegisterState] = useRegistrationState();
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

      {chosenTier !== tier ? (
        <button
          className="select-button"
          onClick={() =>
            dispatchRegisterState({ type: 'setChosenTier', payload: tier })
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
