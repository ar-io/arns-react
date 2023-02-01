import Table from 'rc-table';
import { useEffect, useRef, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ASSET_TYPES, AntMetadata, ArweaveTransactionID } from '../../../types';
import { TABLE_TYPES } from '../../../types';
import { CodeSandboxIcon, NotebookIcon } from '../../icons';
import ManageAssetButtons from '../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { Loader } from '../../layout';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import ManageAntModal from '../../modals/ManageAntModal/ManageAntModal';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  const [tableType, setTableType] = useState(TABLE_TYPES.ANT); // ant_table or name_table
  const [sortAscending, setSortOrder] = useState(true);
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const isMobile = useIsMobile();
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor] = useState<string | undefined>();
  const [reload, setReload] = useState(false);
  const [rows, setRows] = useState<AntMetadata[]>([]);

  useEffect(() => {
    // todo: move this to a separate function to manage error state and poll for new ants to concat them to the state.
    // todo: load imported ants and names first
    if (walletAddress) {
      setIsLoading(true);
      fetchAntRows(walletAddress).finally(() => setIsLoading(false));
    }
  }, [walletAddress, reload]);

  async function fetchAntRows(address: ArweaveTransactionID) {
    const { ids } = await arweaveDataProvider.getContractsForWallet(
      arnsSourceContract.approvedANTSourceCodeTxs,
      address,
      cursor,
    );
    // TODO: make this row a type
    const fetchedRows: AntMetadata[] = [];
    for (const [index, id] of ids.entries()) {
      const [contractState, confirmations] = await Promise.all([
        arweaveDataProvider.getContractState(id),
        arweaveDataProvider.getTransactionStatus(id),
      ]);
      // TODO: add error messages and reload state to row
      const rowData = {
        name: contractState.name ?? 'N/A',
        id: id.toString(),
        target:
          contractState.records['@']?.transactionId ??
          contractState.records['@'],
        status: confirmations ?? 0,
        state: contractState,
        key: index,
      };
      fetchedRows.push(rowData);
    }
    // sort by name by default
    fetchedRows.sort((a, b) => a.name.localeCompare(b.name));
    setRows(fetchedRows);
  }

  function handleClickOutside(e: any) {
    console.log(e);
    if (modalRef.current && modalRef.current === e.target) {
      setSelectedRow(-1);
    }
    return;
  }

  return (
    // eslint-disable-next-line
    <div className="page" ref={modalRef} onClick={handleClickOutside}>
      <div className="flex-column">
        {selectedRow >= 0 ? (
          <ManageAntModal
            closeModal={() => setSelectedRow(-1)}
            antDetails={rows[selectedRow]}
            contractId={new ArweaveTransactionID(rows[selectedRow].id)}
          />
        ) : (
          <>
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
                <Table
                  emptyText={'Uh oh, nothing was found.'}
                  columns={[
                    {
                      title: (
                        <span
                          className="flex-row pointer"
                          style={{ gap: '0.5em' }}
                        >
                          <span>Nickname</span>
                          <NotebookIcon
                            width={24}
                            height={24}
                            fill={'var(--text-faded)'}
                          />
                          {/* TODO: show short arrows */}
                        </span>
                      ),
                      dataIndex: 'name',
                      key: 'name',
                      align: 'left',
                      width: '25%',
                      className: 'white',
                      ellipsis: true,
                      onHeaderCell: () => {
                        return {
                          onClick: () => {
                            rows.sort((a, b) =>
                              // by default we sort by name
                              !sortAscending
                                ? a.name.localeCompare(b.name)
                                : b.name.localeCompare(a.name),
                            );
                            // forces update of rows
                            setRows([...rows]);
                            setSortOrder(!sortAscending);
                          },
                        };
                      },
                    },
                    {
                      title: (
                        <span
                          className="flex-row center pointer"
                          style={{ gap: '0.5em' }}
                        >
                          <span>Contract ID</span>
                          <NotebookIcon
                            width={24}
                            height={24}
                            fill={'var(--text-faded)'}
                          />
                        </span>
                      ),
                      dataIndex: 'id',
                      key: 'id',
                      align: 'center',
                      width: '25%',
                      className: 'white',
                      ellipsis: true,
                      render: (val) =>
                        `${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
                          isMobile ? -2 : -6,
                        )}`,
                      onHeaderCell: () => {
                        return {
                          onClick: () => {
                            rows.sort((a, b) =>
                              sortAscending
                                ? a.id.localeCompare(b.id)
                                : b.id.localeCompare(a.id),
                            );
                            // forces update of rows
                            setRows([...rows]);
                            setSortOrder(!sortAscending);
                          },
                        };
                      },
                    },
                    {
                      title: (
                        <span
                          className="flex-row center pointer"
                          style={{ gap: '0.5em' }}
                        >
                          <span>Target ID</span>
                          <NotebookIcon
                            width={24}
                            height={24}
                            fill={'var(--text-faded)'}
                          />
                        </span>
                      ),
                      dataIndex: 'target',
                      key: 'target',
                      align: 'center',
                      width: '25%',
                      className: 'white',
                      render: (val) =>
                        `${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
                          isMobile ? -2 : -6,
                        )}`,
                      onHeaderCell: () => {
                        return {
                          onClick: () => {
                            rows.sort((a, b) =>
                              sortAscending
                                ? a.target.localeCompare(b.target)
                                : b.target.localeCompare(a.target),
                            );
                            // forces update of rows
                            setRows([...rows]);
                            setSortOrder(!sortAscending);
                          },
                        };
                      },
                    },
                    {
                      title: (
                        <span
                          className="flex-row center pointer"
                          style={{ gap: '0.5em' }}
                        >
                          <span>Status</span>
                          <NotebookIcon
                            width={24}
                            height={24}
                            fill={'var(--text-faded)'}
                          />
                        </span>
                      ),
                      dataIndex: 'status',
                      key: 'status',
                      align: 'center',
                      width: '25%',
                      className: 'white',
                      render: (val) => (
                        <TransactionStatus
                          confirmations={val}
                          wrapperStyle={{
                            justifyContent: 'center',
                          }}
                        />
                      ),
                      onHeaderCell: () => {
                        return {
                          onClick: () => {
                            rows.sort((a, b) =>
                              sortAscending
                                ? a.status - b.status
                                : b.status - a.status,
                            );
                            // forces update of rows
                            setRows([...rows]);
                            setSortOrder(!sortAscending);
                          },
                        };
                      },
                    },
                    {
                      title: '',
                      render: (val: any, row: AntMetadata, index: number) => (
                        <ManageAssetButtons
                          asset={val.id}
                          setShowModal={() => setSelectedRow(index)}
                          assetType={ASSET_TYPES.ANT}
                          disabled={!row.state || !row.status}
                        />
                      ),
                      align: 'right',
                      width: '10%',
                    },
                  ]}
                  data={rows}
                />
              )
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Manage;
