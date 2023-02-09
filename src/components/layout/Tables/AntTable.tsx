import Table from 'rc-table';
import { useEffect, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks/index';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ASSET_TYPES, AntMetadata, ArweaveTransactionID } from '../../../types';
import {
  BookmarkIcon,
  ChevronUpIcon,
  FileCodeIcon,
  NotebookIcon,
  RefreshAlertIcon,
  TargetIcon,
} from '../../icons/index';
import ManageAssetButtons from '../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import Loader from '../Loader/Loader';
import TransactionStatus from '../TransactionStatus/TransactionStatus';

export function AntTable({
  ids,
  setSelectedRow,
}: {
  ids: ArweaveTransactionID[];
  setSelectedRow: (row: AntMetadata) => void;
}) {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof AntMetadata>('name');
  const [rows, setRows] = useState<AntMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (ids.length) {
      setIsLoading(true);
      fetchAntRows(ids).finally(() => setIsLoading(false));
    }
  }, [ids]);

  async function fetchAntRows(ids: ArweaveTransactionID[]) {
    const fetchedRows: AntMetadata[] = [];
    for (const [index, id] of ids.entries()) {
      try {
        const [contractState, confirmations] = await Promise.all([
          arweaveDataProvider.getContractState(id),
          arweaveDataProvider.getTransactionStatus(id),
        ]);
        // TODO: add error messages and reload state to row
        const rowData = {
          name: contractState.name ?? 'N/A',
          id: id.toString(),
          role:
            contractState.owner.toString() === walletAddress?.toString()
              ? 'Owner'
              : contractState.controller === walletAddress?.toString() ||
                contractState.controllers?.includes(walletAddress?.toString())
              ? 'Controller'
              : 'N/A',
          target:
            contractState?.records['@']?.transactionId ??
            contractState?.records['@'],
          status: confirmations ?? 0,
          state: contractState,
          key: index,
        };
        fetchedRows.push(rowData);
      } catch (error) {
        console.error(error);
      } finally {
        // sort by name by default
        fetchedRows.sort((a, b) => a.name.localeCompare(b.name));
        setRows(fetchedRows);
      }
    }
  }

  return isLoading ? (
    <div
      className="flex center"
      style={{ paddingTop: '10%', justifyContent: 'center' }}
    >
      <Loader size={80} />
    </div>
  ) : (
    <Table
      emptyText={'Uh oh, nothing was found.'}
      scroll={{ x: true }}
      columns={[
        {
          title: (
            <button
              className="flex-row pointer white"
              style={{ gap: '0.5em' }}
              onClick={() => setSortField('name')}
            >
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-faded)'}
                style={
                  sortField === 'name' && !sortAscending
                    ? { transform: 'rotate(180deg)' }
                    : {}
                }
              />
              <span>Nickname</span>
              <NotebookIcon width={24} height={24} fill={'var(--text-faded)'} />
            </button>
          ),
          dataIndex: 'name',
          key: 'name',
          align: 'left',
          width: '18%',
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
            <button
              className="flex-row pointer white center"
              style={{ gap: '0.5em' }}
              onClick={() => setSortField('role')}
            >
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-faded)'}
                style={
                  sortField === 'role' && !sortAscending
                    ? { transform: 'rotate(180deg)' }
                    : {}
                }
              />
              <span>Role</span>
              <BookmarkIcon width={24} height={24} fill={'var(--text-faded)'} />
            </button>
          ),
          dataIndex: 'role',
          key: 'role',
          align: 'center',
          width: '18%',
          className: 'white',
          ellipsis: true,
          onHeaderCell: () => {
            return {
              onClick: () => {
                rows.sort((a, b) =>
                  !sortAscending
                    ? a.name.localeCompare(b.role)
                    : b.name.localeCompare(a.role),
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
            <button
              className="flex-row pointer white center"
              style={{ gap: '0.5em' }}
              onClick={() => setSortField('id')}
            >
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-faded)'}
                style={
                  sortField === 'id' && !sortAscending
                    ? { transform: 'rotate(180deg)' }
                    : {}
                }
              />
              <span>Contract ID</span>
              <FileCodeIcon width={24} height={24} fill={'var(--text-faded)'} />
            </button>
          ),
          dataIndex: 'id',
          key: 'id',
          align: 'center',
          width: '18%',
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
            <button
              className="flex-row pointer white center"
              style={{ gap: '0.5em' }}
              onClick={() => setSortField('target')}
            >
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-faded)'}
                style={
                  sortField === 'target' && !sortAscending
                    ? { transform: 'rotate(180deg)' }
                    : {}
                }
              />
              <span>Target ID</span>
              <TargetIcon width={24} height={24} fill={'var(--text-faded)'} />
            </button>
          ),
          dataIndex: 'target',
          key: 'target',
          align: 'center',
          width: '18%',
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
            <button
              className="flex-row pointer white center"
              style={{ gap: '0.5em' }}
              onClick={() => setSortField('status')}
            >
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-faded)'}
                style={
                  sortField === 'status' && !sortAscending
                    ? { transform: 'rotate(180deg)' }
                    : {}
                }
              />
              <span>Status</span>
              <RefreshAlertIcon
                width={24}
                height={24}
                fill={'var(--text-faded)'}
              />
            </button>
          ),
          dataIndex: 'status',
          key: 'status',
          align: 'center',
          width: '18%',
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
                  sortAscending ? a.status - b.status : b.status - a.status,
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
              setShowModal={() => setSelectedRow(rows[index])}
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
  );
}
