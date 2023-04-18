import { useEffect, useState } from 'react';

import {
  BookmarkIcon,
  ChevronUpIcon,
  FileCodeIcon,
  NotebookIcon,
  RefreshAlertIcon,
  TargetIcon,
} from '../../components/icons/index';
import ManageAssetButtons from '../../components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import TransactionStatus from '../../components/layout/TransactionStatus/TransactionStatus';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { ASSET_TYPES, AntMetadata, ArweaveTransactionID } from '../../types';
import eventEmitter from '../../utils/events';
import useIsMobile from '../useIsMobile/useIsMobile';
import useWalletAddress from '../useWalletAddress/useWalletAddress';

export default function useWalletANTs(ids: ArweaveTransactionID[]) {
  const isMobile = useIsMobile();
  const [{ arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof AntMetadata>('status');
  const [selectedRow, setSelectedRow] = useState<AntMetadata>();
  const [rows, setRows] = useState<AntMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number | undefined>();

  useEffect(() => {
    if (ids.length) {
      setIsLoading(true);
      fetchAntRows(ids).finally(() => setIsLoading(false));
    }
  }, [ids]);

  function generateTableColumns(): any[] {
    return [
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
        className: 'icon-padding white',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: AntMetadata, b: AntMetadata) =>
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
              rows.sort((a: AntMetadata, b: AntMetadata) =>
                !sortAscending
                  ? a.role.localeCompare(b.role)
                  : b.role.localeCompare(a.role),
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
        render: (val: string) =>
          `${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
            isMobile ? -2 : -6,
          )}`,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: AntMetadata, b: AntMetadata) =>
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
        render: (val: string) =>
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
        render: (val: number) => (
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
        render: (val: any, row: AntMetadata) => (
          <ManageAssetButtons
            asset={val.id}
            setShowModal={() => setSelectedRow(row)}
            assetType={ASSET_TYPES.ANT}
            disabled={!row.state || !row.status}
          />
        ),
        align: 'right',
        width: '10%',
      },
    ];
  }

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
              : contractState.controller === walletAddress?.toString()
              ? 'Controller'
              : 'N/A',
          target:
            typeof contractState.records['@'] === 'string'
              ? contractState.records['@']
              : contractState.records['@'].transactionId,
          status: confirmations ?? 0,
          state: contractState,
          key: index,
        };
        fetchedRows.push(rowData);
      } catch (error) {
        eventEmitter.emit('error', error);
      } finally {
        // sort by confirmation count (ASC) by default
        fetchedRows.sort((a, b) => a.status - b.status);
        setPercentLoaded(((index + 1) / ids.length) * 100);
        setRows(fetchedRows);
      }
    }
  }

  return {
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows,
    sortField,
    sortAscending,
    selectedRow,
  };
}
