import Table from 'rc-table';
import { useEffect, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ASSET_TYPES, ArweaveTransactionID } from '../../../types';
import { TABLE_TYPES } from '../../../types';
import { CodeSandboxIcon } from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import ManageAssetButtons from '../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { Loader } from '../../layout';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();

  const [tableType, setTableType] = useState(TABLE_TYPES.ANT); // ant_table or name_table
  const [sortAscending, setSortOrder] = useState(true);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [cursor] = useState<string | undefined>();
  const [reload, setReload] = useState(false);
  const [rows, setRows] = useState<
    {
      name: string;
      id: string;
      target: string;
      status: number;
      key: number;
    }[]
  >([]);

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
    const fetchedRows: {
      name: string;
      id: string;
      target: string;
      status: number;
      key: number;
    }[] = [];
    for (const [index, id] of ids.entries()) {
      const [contractState, confirmations] = await Promise.all([
        arweaveDataProvider.getContractState(id),
        arweaveDataProvider.getTransactionStatus(id),
      ]);
      const rowData = {
        name: contractState.name ?? 'N/A',
        id: id.toString(),
        target:
          contractState.records['@']?.transactionId ??
          contractState.records['@'],
        status: confirmations ?? 0,
        key: index,
      };
      fetchedRows.push(rowData);
    }
    // sort by name by default
    fetchedRows.sort((a, b) => a.name.localeCompare(b.name));
    setRows(fetchedRows);
  }

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
            <Table
              rowClassName={'table-row'}
              columns={[
                {
                  title: 'Nickname',
                  dataIndex: 'name',
                  key: 'name',
                  align: 'left',
                  width: '10%',
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
                  title: 'Contract ID',
                  dataIndex: 'id',
                  key: 'id',
                  align: 'center',
                  width: '35%',
                  className: 'white',
                  ellipsis: true,
                  render: (val) => (
                    <CopyTextButton
                      displayText={`${val.slice(
                        0,
                        isMobile ? 2 : 6,
                      )}...${val.slice(isMobile ? -2 : -6)}`}
                      copyText={val}
                      size={24}
                      wrapperStyle={{
                        position: 'unset',
                        justifyContent: 'center',
                      }}
                    />
                  ),
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
                  title: 'Target ID',
                  dataIndex: 'target',
                  key: 'target',
                  align: 'center',
                  width: '35%',
                  className: 'white',
                  render: (val) => (
                    <CopyTextButton
                      displayText={`${val.slice(
                        0,
                        isMobile ? 2 : 6,
                      )}...${val.slice(isMobile ? -2 : -6)}`}
                      copyText={val}
                      size={24}
                      wrapperStyle={{
                        position: 'unset',
                        justifyContent: 'center',
                      }}
                    />
                  ),
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
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  align: 'center',
                  width: '10%',
                  className: 'white',
                  render: (val) => <TransactionStatus confirmations={val} />,
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
                  render: (val) => (
                    <ManageAssetButtons
                      asset={val.id}
                      setShowModal={() => alert('hello!')}
                      assetType={ASSET_TYPES.ANT}
                    />
                  ),
                  align: 'right',
                  width: '10%',
                },
              ]}
              data={rows}
              showHeader={true}
              scroll={{ y: 300 }}
            />
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Manage;
