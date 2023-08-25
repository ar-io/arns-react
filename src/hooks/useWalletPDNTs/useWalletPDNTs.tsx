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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        className: 'white assets-table-header',
        render: (hasPending: boolean, row: any) => {
          if (hasPending) {
            return (
              <Tooltip
                placement="right"
                title={
                  <Link
                    className="link white text underline"
                    to={`/manage/pdnts/${row.id}`}
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
              fill={'var(--text-grey)'}
              style={
                sortField === 'name' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Nickname</span>
            <NotebookIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'white assets-table-header',
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
              fill={'var(--text-grey)'}
              style={
                sortField === 'role' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Role</span>
            <BookmarkIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'role',
        key: 'role',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
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
              fill={'var(--text-grey)'}
              style={
                sortField === 'id' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Contract ID</span>
            <FileCodeIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
        ellipsis: true,
        render: (val: string) =>
          val === 'N/A' ? (
            val
          ) : (
            <CopyTextButton
              copyText={val}
              body={`${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
                isMobile ? -2 : -6,
              )}`}
              size={16}
              position="relative"
              wrapperStyle={{
                color: 'white',
                alignItems: 'center',
                margin: 'auto',
                fontSize: '16px',
                fill: 'var(--text-grey)',
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
            onClick={() => setSortField('targetID')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'targetID' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Target ID</span>
            <TargetIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'targetID',
        key: 'targetID',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
        render: (val: string) =>
          val === 'N/A' ? (
            val
          ) : (
            <CopyTextButton
              copyText={val}
              body={`${val.slice(0, isMobile ? 2 : 6)}...${val.slice(
                isMobile ? -2 : -6,
              )}`}
              size={16}
              position="relative"
              wrapperStyle={{
                color: 'white',
                alignItems: 'center',
                margin: 'auto',
                fontSize: '16px',
                fill: 'var(--text-grey)',
              }}
            />
          ),

        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a, b) =>
                sortAscending
                  ? a.targetID.localeCompare(b.targetID)
                  : b.targetID.localeCompare(a.targetID),
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
              fill={'var(--text-grey)'}
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
              fill={'var(--text-grey)'}
            />
          </button>
        ),
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
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
        className: 'white assets-table-header',
        render: (val: any, row: PDNTMetadata) => (
          <ManageAssetButtons
            id={val.id}
            assetType="ants"
            disabled={!row.state || !row.status}
          />
        ),
        align: 'right',
        width: '10%',
      },
    ];
  }

  async function fetchRowData(
    contractTxId: ArweaveTransactionID,
    address: ArweaveTransactionID,
    key: number,
  ) {
    try {
      const [contractState, confirmations, pendingContractInteractions] =
        await Promise.all([
          arweaveDataProvider.getContractState<PDNTContractJSON>(
            contractTxId,
            address,
          ),
          arweaveDataProvider.getTransactionStatus(contractTxId).catch((e) => {
            console.error(e);
          }),
          arweaveDataProvider
            .getPendingContractInteractions(contractTxId, address.toString())
            .catch((e) => {
              console.error(e);
            }),
        ]);

      if (!contractState) {
        throw Error(`Failed to load contract: ${contractTxId.toString()}`);
      }

      const contract = new PDNTContract(contractState, contractTxId);

      // simple check that it is ANT shaped contract
      if (!contract.isValid()) {
        throw new Error('Invalid contract');
      }

      const target =
        contract.getRecord('@') && contract.getRecord('@')?.transactionId !== ''
          ? contract.getRecord('@')?.transactionId
          : undefined;

      // TODO: add error messages and reload state to row
      const rowData = {
        name: contract.name ?? 'N/A',
        id: contractTxId.toString(),
        role:
          contract.owner === walletAddress?.toString()
            ? 'Owner'
            : contract.controller === walletAddress?.toString()
            ? 'Controller'
            : 'N/A',
        targetID: target ?? 'N/A',
        ttlSeconds: contract.getRecord('@')?.ttlSeconds,
        status: confirmations ?? 0,
        state: contractState,
        key,
      };

      // get any pending transactions for various attributes
      const pendingTxsForContract = getPendingInteractionsRowsForContract(
        pendingContractInteractions ?? [],
        rowData,
      );

      // replace the values with pending ones until the interaction is confirmed
      const pendingInteractions = pendingTxsForContract.reduce(
        (pendingValues, i) => ({
          ...pendingValues,
          [i.attribute]: i.value,
        }),
        {},
      );

      return {
        ...rowData,
        ...pendingInteractions,
        hasPending: pendingTxsForContract.length,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPDNTRows(
    ids: ArweaveTransactionID[],
    address: ArweaveTransactionID,
  ) {
    const fetchedRows: PDNTMetadata[] = [];
    const tokenIds = new Set(ids);

    try {
      setIsLoading(true);
      const cachedTokens = await arweaveDataProvider.getCachedNameTokens(
        address,
      );
      if (cachedTokens?.length) {
        cachedTokens.forEach((token: PDNTContract) => {
          if (token?.id) {
            tokenIds.add(new ArweaveTransactionID(token.id.toString()));
          }
        });
      }
      const allData: PDNTMetadata[] = await Promise.all(
        [...tokenIds].map((id, index) => fetchRowData(id, address, index)),
      ).then((rows) =>
        rows.reduce((acc: PDNTMetadata[], row: PDNTMetadata | undefined) => {
          if (row) {
            acc.push(row);
          }
          return acc;
        }, []),
      );
      fetchedRows.push(...allData);
      // sort by confirmation count (ASC) by default
      fetchedRows.sort((a, b) => a?.status - b?.status);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setPercentLoaded((fetchedRows.length / tokenIds.size) * 100);
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
