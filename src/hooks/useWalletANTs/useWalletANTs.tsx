import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useWalletAddress } from '..';
import {
  ChevronUpIcon,
  CirclePending,
  ExternalLinkIcon,
} from '../../components/icons/index';
import ManageAssetButtons from '../../components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import TransactionStatus from '../../components/layout/TransactionStatus/TransactionStatus';
import { PDNTContract } from '../../services/arweave/PDNTContract';
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  ANTMetadata,
  ArweaveTransactionID,
  ContractInteraction,
  PDNTContractJSON,
} from '../../types';
import { isArweaveTransactionID } from '../../utils';
import eventEmitter from '../../utils/events';

type ANTData = {
  contract: PDNTContract;
  transactionBlockHeight?: number;
  pendingContractInteractions?: ContractInteraction[];
  errors?: string[];
};

export function useWalletANTs() {
  const [{ blockHeight, arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof ANTMetadata>('status');
  const [antData, setAntData] = useState<ANTData[]>([]);
  const [rows, setRows] = useState<ANTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemCount = useRef<number>(0);
  const itemsLoaded = useRef<number>(0);
  const [percent, setPercentLoaded] = useState<number | undefined>();

  useEffect(() => {
    load();
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      buildANTRows(antData, walletAddress, blockHeight);
    }
  }, [antData, blockHeight]);

  async function load() {
    try {
      setIsLoading(true);
      if (walletAddress) {
        const { contractTxIds } =
          await arweaveDataProvider.getContractsForWallet(
            walletAddress,
            'ant', // only fetches contracts that have a state that matches ant spec
          );
        const data = await fetchANTData(
          contractTxIds,
          walletAddress,
          blockHeight,
        );
        setAntData(data);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsLoading(false);
    }
  }

  function generateTableColumns(): any[] {
    return [
      {
        title: '',
        dataIndex: 'hasPending',
        key: 'hasPending',
        align: 'left',
        width: '1%',
        className: 'grey manage-assets-table-header',
        render: (hasPending: boolean, row: any) => {
          if (hasPending) {
            return (
              <Tooltip
                placement="right"
                title={
                  <Link
                    className="link white text underline"
                    to={`/manage/ants/${row.id}`}
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
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('name')}
          >
            <span>Nickname</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'name' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'name' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: ANTMetadata, b: ANTMetadata) =>
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
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('role')}
          >
            <span>Role</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'role' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'role' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'role',
        key: 'role',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: ANTMetadata, b: ANTMetadata) =>
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
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('id')}
          >
            <span>Contract ID</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'id' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'id' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'id',
        key: 'id',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
        render: (val: string) =>
          val === 'N/A' ? (
            val
          ) : (
            <ArweaveID
              id={new ArweaveTransactionID(val)}
              characterCount={12}
              shouldLink
              type={ArweaveIdTypes.CONTRACT}
            />
          ),

        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: ANTMetadata, b: ANTMetadata) =>
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
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('targetID')}
          >
            <span>Target ID</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'targetID' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'targetID' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'targetID',
        key: 'targetID',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        render: (val: string) =>
          val === 'N/A' || !isArweaveTransactionID(val) ? (
            val
          ) : (
            <ArweaveID
              id={new ArweaveTransactionID(val)}
              characterCount={12}
              shouldLink
              type={ArweaveIdTypes.TRANSACTION}
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
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('status')}
          >
            <span>Status</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'status' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'status' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        render: (val: number, row: ANTMetadata) => (
          <TransactionStatus
            confirmations={val}
            errorMessage={
              !val && !row.hasPending
                ? row.errors?.length
                  ? row.errors?.join(', ')
                  : 'Unable to get confirmations for ANT Contract'
                : undefined
            }
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
        className: 'white manage-assets-table-header',
        render: (val: any, row: ANTMetadata) => (
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

  async function fetchANTData(
    contractTxIds: ArweaveTransactionID[],
    address: ArweaveTransactionID,
    currentBlockHeight?: number,
  ): Promise<ANTData[]> {
    let datas: ANTData[] = [];
    try {
      itemsLoaded.current = 0;
      const tokenIds = new Set(contractTxIds);

      const cachedTokens = await arweaveDataProvider.getCachedNameTokens(
        address,
      );
      if (cachedTokens.length) {
        cachedTokens.forEach((token: PDNTContract) => {
          if (token?.id) {
            tokenIds.add(new ArweaveTransactionID(token.id.toString()));
          }
        });
      }
      itemCount.current = tokenIds.size;

      const allTransactionBlockHeights = await arweaveDataProvider
        .getTransactionStatus([...tokenIds], currentBlockHeight)
        .catch((e) => console.error(e));

      const newDatas = contractTxIds.map(
        async (contractTxId: ArweaveTransactionID) => {
          const errors = [];
          const [contractState, confirmations, pendingContractInteractions] =
            await Promise.all([
              arweaveDataProvider.getContractState<PDNTContractJSON>(
                contractTxId,
                address,
              ),
              allTransactionBlockHeights
                ? allTransactionBlockHeights[contractTxId.toString()]
                    .blockHeight
                : 0,
              arweaveDataProvider
                .getPendingContractInteractions(
                  contractTxId,
                  address.toString(),
                )
                .catch((e) => {
                  console.error(e);
                }),
            ]);

          if (!contractState) {
            errors.push(`Failed to load contract: ${contractTxId.toString()}`);
          }

          const contract = new PDNTContract(contractState, contractTxId);

          // simple check that it is ANT shaped contract
          if (!contract.isValid()) {
            errors.push('Invalid contract');
          }
          // TODO: react strict mode makes this increment twice in dev
          if (itemsLoaded.current < itemCount.current) itemsLoaded.current++;

          setPercentLoaded(
            Math.round((itemsLoaded.current / itemCount.current) * 100),
          );

          return {
            contract,
            status: confirmations ?? 0,
            transactionBlockHeight: allTransactionBlockHeights
              ? allTransactionBlockHeights[contractTxId.toString()].blockHeight
              : 0,
            pendingContractInteractions,
            errors,
          } as ANTData;
        },
      );

      datas = await Promise.all(newDatas);
    } catch (error) {
      console.error(error);
    }
    return datas;
  }

  function buildANTRows(
    datas: ANTData[],
    address: ArweaveTransactionID,
    currentBlockHeight?: number,
  ) {
    const fetchedRows: ANTMetadata[] = datas.map((data, i) => {
      const {
        contract,
        transactionBlockHeight,
        pendingContractInteractions,
        errors,
      } = data;
      const target =
        contract.getRecord('@') && contract.getRecord('@')?.transactionId !== ''
          ? contract.getRecord('@')?.transactionId
          : undefined;
      const rowData = {
        name: contract.name ?? 'N/A',
        id: contract.id ? contract.id?.toString() : 'N/A',
        role:
          contract.owner === address.toString()
            ? 'Owner'
            : contract.controllers.includes(address.toString())
            ? 'Controller'
            : 'N/A',
        targetID: target ?? 'N/A',
        ttlSeconds: contract.getRecord('@')?.ttlSeconds,
        status:
          transactionBlockHeight && currentBlockHeight
            ? currentBlockHeight - transactionBlockHeight
            : 0,
        state: contract.state,
        hasPending: !!pendingContractInteractions?.length,
        errors,
        key: i,
      };
      return rowData;
    });

    setRows(fetchedRows);
  }

  return {
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows,
    sortField,
    sortAscending,
    refresh: load,
  };
}
