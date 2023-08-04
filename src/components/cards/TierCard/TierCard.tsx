import { useGlobalState } from '../../../state/contexts/GlobalState';
import { TierCardProps } from '../../../types';
import { TIER_DATA } from '../../../utils/constants';
import { CircleCheck } from '../../icons';
import './styles.css';

function TierCard({ tierId }: TierCardProps) {
  const [{ pdnsSourceContract }] = useGlobalState();
  const tiers = pdnsSourceContract.tiers.current;
  const tierNumber = tiers.indexOf(tierId);
  return (
    <div className="tier-card hover">
      <div className="text bubble-small">Tier&nbsp;{tierNumber}</div>

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

      {tiers[tierNumber] !== tierId ? (
        <button
          className="select-button"
          onClick={() => {
            // TODO: add action for setting tier in context provider
          }}
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
