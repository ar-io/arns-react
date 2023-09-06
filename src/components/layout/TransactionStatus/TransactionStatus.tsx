import { RECOMMENDED_TRANSACTION_CONFIRMATIONS } from '../../../utils/constants';
import { AlertCircle, AlertTriangleIcon, CircleCheck } from '../../icons';

function TransactionStatus({
  confirmations,
  wrapperStyle,
}: {
  confirmations: number;
  wrapperStyle?: any;
}): JSX.Element {
  function getStatusIcon(confirmations: number): JSX.Element {
    switch (true) {
      case confirmations <= 0:
        return (
          <AlertCircle width={20} height={20} fill={'var(--text-faded)'} />
        );
      case confirmations > 0 &&
        confirmations < RECOMMENDED_TRANSACTION_CONFIRMATIONS:
        return (
          <AlertTriangleIcon width={20} height={20} fill={'var(--accent)'} />
        );
      case confirmations >= RECOMMENDED_TRANSACTION_CONFIRMATIONS:
        return (
          <CircleCheck width={20} height={20} fill={'var(--success-green)'} />
        );
      default:
        return <></>;
    }
  }
  return (
    <span
      className="text white bold"
      style={{ alignItems: 'center', ...wrapperStyle }}
    >
      {getStatusIcon(confirmations)}
    </span>
  );
}
export default TransactionStatus;
