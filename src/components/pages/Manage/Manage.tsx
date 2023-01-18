import { useEffect, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { TABLE_TYPES } from '../../../types';
import { CodeSandboxIcon } from '../../icons';
import { Loader } from '../../layout';
import { AntTable } from '../../layout/tables';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract }] = useGlobalState();
  const { walletAddress, wallet } = useWalletAddress();

  const [tableType, setTableType] = useState(TABLE_TYPES.ANT); // ant_table or name_table

  const [isLoading, setIsLoading] = useState(false);
  const [walletANTs, setWalletANTs] = useState<string[]>([]);
  const [cursor] = useState<string | undefined>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    // todo: move this to a seperate function to manage error state and poll for new ants to concat them to the state.
    // todo: load imported ants and names first
    if (wallet) {
      setIsLoading(true);
      wallet
        .getWalletANTs(arnsSourceContract.approvedANTSourceCodeTxs, cursor)
        .then(({ ids }: { ids: string[]; cursor?: string }) => {
          setWalletANTs(ids);
          // don't set cursor for now
        })
        .finally(() => setIsLoading(false))
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
            onClick={() => {
              setTableType(TABLE_TYPES.ANT);
              setReload(!reload);
            }}
            style={
              tableType === TABLE_TYPES.ANT
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

        {tableType === TABLE_TYPES.ANT ? (
          isLoading ? (
            <div
              className="flex center"
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
