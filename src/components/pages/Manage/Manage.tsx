import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveGraphQLAPI, ArweaveWalletConnector } from '../../../types.js';
import { CopyIcon } from '../../icons';
import { Loader } from '../../layout';

function Manage() {
  const [{ arnsSourceContract }] = useGlobalState();
  const { walletAddress, wallet } = useWalletAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [walletANTs, setWalletANTs] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    if (wallet) {
      setIsLoading(true);
      fetchAnts()
        .catch((error: Error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [wallet, walletAddress]);

  async function fetchAnts() {
    return wallet
      .getWalletANTs(arnsSourceContract.approvedANTSourceCodeTxs, cursor)
      .then(({ ids, cursor }: { ids: string[]; cursor?: string }) => {
        setWalletANTs(ids);
        setCursor(cursor);
      });
  }

  return (
    <div className="page">
      {isLoading ? (
        <Loader size={80} />
      ) : (
        walletANTs.map((id) => (
          <div className="flex-row" key={id}>
            <span className="text white hover link" style={{ width: '100px' }}>
              {`${id.slice(0, 7)}...${id.slice(-7)}`}
            </span>
            <CopyIcon
              style={{
                height: '24px',
                width: '24px',
                fill: 'white',
                cursor: 'pointer',
              }}
              onClick={async () => {
                await navigator.clipboard.writeText(id);
              }}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default Manage;
