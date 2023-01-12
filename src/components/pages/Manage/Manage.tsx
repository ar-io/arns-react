import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { CodeSandboxIcon, NotebookIcon } from '../../icons';
import {
  CalendarTimeIcon,
  LinkIcon,
  PriceTagIcon,
  RefreshAlertIcon,
} from '../../icons';
import { AntTable, NameTable } from '../../layout/tables';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract }] = useGlobalState();
  const { walletAddress, wallet } = useWalletAddress();

  const [tableType, setTableType] = useState('ant'); // ant or name

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
    const { ids, cursor: newCursor } = await wallet.getWalletANTs(
      arnsSourceContract.approvedANTSourceCodeTxs,
      cursor,
    );

    // TODO: fetch other interactions and names
    setWalletANTs(ids);
    setCursor(newCursor);
  }

  return (
    <div className="page">
      <div className="flex-column">
        <div className="table-selector-group">
          <button
            className="table-selector text bold center"
            onClick={() => setTableType('name')}
            style={
              tableType === 'name'
                ? {
                    borderColor: 'var(--text-white)',
                    color: 'var(--text-white)',
                    fill: 'var(--text-white)',
                  }
                : {}
            }
          >
            <NotebookIcon width={'20px'} height="20px" />
            Domains
          </button>
          <button
            className="table-selector text bold center"
            onClick={() => setTableType('ant')}
            style={
              tableType === 'ant'
                ? {
                    borderColor: 'var(--text-white)',
                    color: 'var(--text-white)',
                    fill: 'var(--text-white)',
                  }
                : {}
            }
          >
            <CodeSandboxIcon width={'20px'} height="20px" />
            ANTs
          </button>
        </div>

        {tableType === 'name' ? (
          <NameTable
            columns={{
              Name: (
                <LinkIcon
                  width={'20px'}
                  height={'30px'}
                  fill={'var(--text-faded)'}
                />
              ),
              Tier: (
                <PriceTagIcon
                  width={'20px'}
                  height={'30px'}
                  fill={'var(--text-faded)'}
                />
              ),
              'Expiry Date': (
                <CalendarTimeIcon
                  width={'20px'}
                  height={'30px'}
                  fill={'var(--text-faded)'}
                />
              ),
              Status: (
                <RefreshAlertIcon
                  width={'20px'}
                  height={'30px'}
                  fill={'var(--text-faded)'}
                />
              ),
            }}
          />
        ) : (
          <></>
        )}
        {tableType === 'ant' ? (
          <AntTable antIds={walletANTs} isLoading={isLoading} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Manage;
