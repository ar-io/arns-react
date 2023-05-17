import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile, useWalletAddress } from '..';
import {
  BookmarkIcon,
  ChevronUpIcon,
  CirclePending,
  ExternalLinkIcon,
  FileCodeIcon,
  NotebookIcon,
  RefreshAlertIcon,
  TargetIcon,
} from '../../components/icons/index';
import CopyTextButton from '../../components/inputs/buttons/CopyTextButton/CopyTextButton';
import ManageAssetButtons from '../../components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import TransactionStatus from '../../components/layout/TransactionStatus/TransactionStatus';
import { PDNTContract } from '../../services/arweave/PDNTContract';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  PDNTMetadata,
} from '../../types';
import { getPendingInteractionsRowsForContract } from '../../utils';
import eventEmitter from '../../utils/events';

export function useWalletPDNTs(ids: ArweaveTransactionID[]) {
  const isMobile = useIsMobile();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof PDNTMetadata>('status');
  const [rows, setRows] = useState<PDNTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number | undefined>();

  useEffect(() => {
    if (ids.length && walletAddress) {
      fetchPDNTRows(ids, walletAddress);
    }
  }, [ids]);

  function generateTableColumns(): any[] {
    return [
      {
        title: '',
        dataIndex: 'hasPending',
        key: 'hasPending',
        align: 'left',
        width: '2%',
        className: 'white',
        render: (hasPending: boolean, row: any) => {
          if (hasPending) {
            return (
              <Tooltip
                placement="right"
                title={
                  <Link
                    className="link white text underline"
                    to={`https://viewblock.io/arweave/contract/${row.id}?type=all`}
                    target="_blank"
                  >
                    This contract has pending transactions.
                    <ExternalLinkIcon
                      height={12}
                      width={12}
                      fill={'var(--text-white)'}
                    />
                  </Link>
                }
                showArrow={true}
                overlayStyle={{
                  maxWidth: 'fit-content',
                }}
              >
                <CirclePending height={20} width={20} fill={'var(--accent)'} />
              </Tooltip>
            );
          }
          return <></>;
        },
      },
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
              rows.sort((a: PDNTMetadata, b: PDNTMetadata) =>
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
              rows.sort((a: PDNTMetadata, b: PDNTMetadata) =>
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
          val === 'N/A' ? (
            val
          ) : (
            <CopyTextButton
              copyText={val}
              displayText={`${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
                isMobile ? -2 : -6,
              )}`}
              size={'70%'}
              position="relative"
              wrapperStyle={{
                alignItems: 'center',
                margin: 'auto',
                fontSize: '16px',
              }}
            />
          ),

        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PDNTMetadata, b: PDNTMetadata) =>
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
          val === 'N/A' ? (
            val
          ) : (
            <CopyTextButton
              copyText={val}
              displayText={`${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
                isMobile ? -2 : -6,
              )}`}
              size={'70%'}
              position="relative"
              wrapperStyle={{
                alignItems: 'center',
                margin: 'auto',
                fontSize: '16px',
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
        render: (val: any, row: PDNTMetadata) => (
          <ManageAssetButtons
            id={val.id}
            assetType="pdnts"
            disabled={!row.state || !row.status}
          />
        ),
        align: 'right',
        width: '10%',
      },
    ];
  }

  async function fetchPDNTRows(
    ids: ArweaveTransactionID[],
    address: ArweaveTransactionID,
  ) {
    const fetchedRows: PDNTMetadata[] = [];
    setIsLoading(true);
    for (const [index, contractTxId] of ids.entries()) {
      try {
        const [contractState, confirmations, pendingContractInteractions] =
          await Promise.all([
            arweaveDataProvider.getContractState<PDNTContractJSON>(contractTxId),
            arweaveDataProvider.getTransactionStatus(contractTxId),
            arweaveDataProvider.getPendingContractInteractions(
              contractTxId,
              address.toString(),
            ),
          ]);

        if (!contractState) {
          throw Error(`Failed to load contract: ${contractTxId.toString()}`);
        }

        const contract = new PDNTContract(contractState, contractTxId);

        const target =
          contract.getRecord('@') &&
          contract.getRecord('@')?.transactionId !== ''
            ? contract.getRecord('@')?.transactionId
            : undefined;

        // TODO: add error messages and reload state to row
        const rowData = {
          name: contract.name ?? 'N/A',
          id: contractTxId.toString(),
          role:
            contractState.owner.toString() === walletAddress?.toString()
              ? 'Owner'
              : contractState.controller === walletAddress?.toString()
              ? 'Controller'
              : 'N/A',
          target: target ?? 'N/A',
          status: confirmations ?? 0,
          state: contractState,
          key: index,
        };
        const pendingTxsForContract = getPendingInteractionsRowsForContract(
          pendingContractInteractions,
          rowData,
        );

        const pendingInteractions = pendingTxsForContract.reduce(
          (pendingValues, i) => ({
            ...pendingValues,
            [i.attribute]: i.value,
          }),
          {},
        );

        const updatedRowData = {
          ...rowData,
          ...pendingInteractions,
          hasPending: pendingTxsForContract.length,
        };

        fetchedRows.push(updatedRowData);
        // sort by confirmation count (ASC) by default
        fetchedRows.sort((a, b) => a.status - b.status);
      } catch (error) {
        eventEmitter.emit('error', error);
      } finally {
        setPercentLoaded(((index + 1) / ids.length) * 100);
      }
    }
    setRows(fetchedRows);
    setIsLoading(false);
  }

  return {
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows,
    sortField,
    sortAscending,
  };
}
