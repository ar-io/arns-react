import { useEffect, useRef, useState } from 'react';

import { useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AntMetadata, ArweaveTransactionID } from '../../../types';
import { TABLE_TYPES } from '../../../types';
import { CodeSandboxIcon } from '../../icons';
import { AntTable } from '../../layout/Tables/AntTable/AntTable';
import ManageAntModal from '../../modals/ManageAntModal/ManageAntModal';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  const [tableType, setTableType] = useState(TABLE_TYPES.ANT); // ant_table or name_table

  const modalRef = useRef(null);
  const [cursor] = useState<string | undefined>();
  const [antIds, setAntIDs] = useState<ArweaveTransactionID[]>([]);
  const [selectedRow, setSelectedRow] = useState<AntMetadata>();

  useEffect(() => {
    // todo: move this to a separate function to manage error state and poll for new ants to concat them to the state.
    if (walletAddress) {
      fetchWalletAnts(walletAddress);
    }
  }, [walletAddress?.toString()]);

  async function fetchWalletAnts(address: ArweaveTransactionID) {
    try {
      const { ids } = await arweaveDataProvider.getContractsForWallet(
        arnsSourceContract.approvedANTSourceCodeTxs.map(
          (id: string) => new ArweaveTransactionID(id),
        ),
        address,
        cursor,
      );
      setAntIDs(ids);
    } catch (error: any) {
      console.error(error);
    }
  }

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      setSelectedRow(undefined);
    }
    return;
  }

  return (
    // eslint-disable-next-line
    <div className="page" ref={modalRef} onClick={handleClickOutside}>
      <div className="flex-column">
        {selectedRow ? (
          <ManageAntModal
            closeModal={() => setSelectedRow(undefined)}
            antDetails={selectedRow}
            contractId={new ArweaveTransactionID(selectedRow.id)}
          />
        ) : (
          <>
            <div className="table-selector-group">
              <button
                className="table-selector text bold center"
                onClick={() => {
                  setTableType(TABLE_TYPES.ANT);
                  walletAddress && fetchWalletAnts(walletAddress);
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
              <AntTable
                setSelectedRow={(row: AntMetadata) => setSelectedRow(row)}
                ids={antIds}
              />
            ) : (
              // name table
              <></>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Manage;
