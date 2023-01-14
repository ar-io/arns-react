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
import { Loader } from '../../layout';
import { AntTable, NameTable } from '../../layout/tables';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract }] = useGlobalState();
  const { walletAddress, wallet } = useWalletAddress();

  const [tableType, setTableType] = useState('ant'); // ant or name

  const [isLoading, setIsLoading] = useState(false);
  const [walletANTs, setWalletANTs] = useState<string[]>([]);
  const [cursor] = useState<string | undefined>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (wallet) {
      setIsLoading(true);
      wallet
        .getWalletANTs(arnsSourceContract.approvedANTSourceCodeTxs, cursor)
        .then(({ ids }: { ids: string[]; cursor?: string }) => {
          setWalletANTs(ids);
          setIsLoading(false);

          // don't set cursor for now
        })
        .catch((error: Error) => {
          console.error(error);
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
            onClick={() => {
              setTableType('ant');
              setReload(!reload);
            }}
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
          isLoading ? (
            <div
              className="flex-row center"
              style={{ paddingTop: '10%', justifyContent: 'center' }}
            >
              <Loader size={80} />
            </div>
          ) : (
            <AntTable antIds={walletANTs} reload={reload} />
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Manage;
