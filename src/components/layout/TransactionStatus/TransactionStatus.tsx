import { useIsMobile } from '../../../hooks';
import { AlertCircle, AlertTriangleIcon, CircleCheck } from '../../icons';

function TransactionStatus({
  confirmations,
}: {
  confirmations: number;
}): JSX.Element {
  const isMobile = useIsMobile();

  function getStatusIcon(confirmations: number): JSX.Element {
    switch (true) {
      case confirmations <= 0:
        return (
          <AlertCircle width={20} height={20} fill={'var(--text-faded)'} />
        );
      case confirmations > 0 && confirmations < 50:
        return (
          <AlertTriangleIcon width={20} height={20} fill={'var(--accent)'} />
        );
      case confirmations >= 50:
        return (
          <CircleCheck width={20} height={20} fill={'var(--success-green)'} />
        );
      default:
        return <></>;
    }
  }
  return (
    <span className="text white bold center">
      {getStatusIcon(confirmations)}&nbsp;
      {!isMobile ? `${confirmations} / 50` : <></>}
    </span>
  );
}
export default TransactionStatus;
