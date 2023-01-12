import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { CodeSandboxIcon } from '../../icons';
import { Loader } from '../../layout';
import { AntTable } from '../../layout/tables';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract }] = useGlobalState();
  const { walletAddress, wallet } = useWalletAddress();

  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletANTs, setWalletANTs] = useState<string[]>([]);
  const [cursor] = useState<string | undefined>();

  useEffect(() => {
    if (wallet) {
      setIsLoading(true);
      wallet
        .getWalletANTs(arnsSourceContract.approvedANTSourceCodeTxs, cursor)
        .then(({ ids }: { ids: string[]; cursor?: string }) => {
          setWalletANTs(ids);
          // don't set cursor for now
        })
        .catch((error: Error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [walletAddress, reload]);

  return (
    <div className="page">
      <div className="flex-column">
        <div className="table-selector-group">
          <button
            className="table-selector text bold center"
            onClick={() => setReload(!reload)}
            style={{
              borderColor: 'var(--text-white)',
              color: 'var(--text-white)',
              fill: 'var(--text-white)',
            }}
          >
            <CodeSandboxIcon width={'20px'} height="20px" />
            ANTs
          </button>
        </div>
        {isLoading ? <Loader size={80} /> : <AntTable antIds={walletANTs} />}
      </div>
    </div>
  );
}

export default Manage;
