import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { defaultDataProvider } from '../../../services/arweave';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AlertCircle, AlertTriangleIcon, CircleCheck } from '../../icons';
import Loader from '../Loader/Loader';

function TransactionStatus({ id }: { id: string }): JSX.Element {
  const [{ arweave }] = useGlobalState();
  const isMobile = useIsMobile();
  const dataProvider = defaultDataProvider(arweave);
  const [loading, setLoading] = useState(true);
  const [confirmations, setConfirmations] = useState(0);
  const [statusIcon, setStatusIcon] = useState(<></>);

  useEffect(() => {
    setLoading(true);
    dataProvider.getContractConfirmations(id).then((res) => {
      setConfirmations(res);
      if (res > 0 && res < 50) {
        setStatusIcon(
          <AlertTriangleIcon width={20} height={20} fill={'var(--accent)'} />,
        );
      }
      if (res > 49) {
        setStatusIcon(
          <CircleCheck width={20} height={20} fill={'var(--success-green)'} />,
        );
      }
      if (res <= 0) {
        setStatusIcon(
          <AlertCircle width={20} height={20} fill={'var(--text-faded)'} />,
        );
      }
    });

    setLoading(false);
  }, [id]);

  return (
    <>
      {!loading ? (
        <span className="text white bold center">
          {statusIcon}&nbsp;{!isMobile ? `${confirmations} / 50` : <></>}
        </span>
      ) : (
        <Loader size={30} />
      )}
    </>
  );
}

export default TransactionStatus;
