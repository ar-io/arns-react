import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ChevronUpIcon,
  CirclePending,
  ExternalLinkIcon,
} from '../../components/icons/index';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import TransactionStatus from '../../components/layout/TransactionStatus/TransactionStatus';
import { useArweaveCompositeProvider, useWalletAddress } from '../../hooks';
import { PDNTContract } from '../../services/arweave/PDNTContract';
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  ContractInteraction,
  PDNSDomains,
  PDNSRecordEntry,
  PDNSTableRow,
  PDNTContractJSON,
  TRANSACTION_TYPES,
} from '../../types';
import {
  decodeDomainToASCII,
  getPendingInteractionsRowsForContract,
  handleTableSort,
} from '../../utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  PDNS_REGISTRY_ADDRESS,
  YEAR_IN_MILLISECONDS,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';

export function useWalletDomains(ids: ArweaveTransactionID[]) {
  const [{ gateway, pdnsSourceContract, blockHeight }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof PDNSTableRow>('status');
  const [selectedRow] = useState<PDNSTableRow>();
  const [rows, setRows] = useState<PDNSTableRow[]>([]);
  // loading info
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemCount, setItemCount] = useState<number>(0);
  const [itemsLoaded, setItemsLoaded] = useState<number>(0);
  const [percent, setPercentLoaded] = useState<number | undefined>();
  const [loadingManageDomain, setLoadingManageDomain] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    if (ids.length) {
      0;
      fetchDomainRows(ids, walletAddress!);
    }
  }, [ids]);

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
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('name')}
          >
            <span>Name</span>{' '}
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
        render: (name: string) => (
          <a
            className="link"
            target="_blank"
            href={`https://${name}.${gateway}`}
            rel="noreferrer"
          >
            {name}
            <ExternalLinkIcon
              height={20}
              width={20}
              viewBox={'0 -3 5 20'}
              fill={'var(--text-white)'}
            />
          </a>
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PDNSTableRow, b: PDNSTableRow) =>
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
        width: '18%',
        align: 'left',
        className: 'white manage-assets-table-header',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PDNSTableRow, b: PDNSTableRow) =>
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
        width: '18%',
        className: 'white manage-assets-table-header',
        align: 'left',
        ellipsis: true,
        render: (id: ArweaveTransactionID) => (
          <ArweaveID
            id={id}
            characterCount={12}
            shouldLink
            type={ArweaveIdTypes.CONTRACT}
          />
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<PDNSTableRow>({
                key: 'id',
                isAsc: sortAscending,
                rows,
              });
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
            onClick={() => setSortField('undernames')}
          >
            <span>Undernames</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'undernames' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'undernames' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'undernames',
        key: 'undernames',
        width: '18%',
        className: 'white manage-assets-table-header',
        align: 'left',
        ellipsis: true,
        render: (undernames: number | string) => undernames.toLocaleString(),
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PDNSTableRow, b: PDNSTableRow) =>
                sortAscending
                  ? +a.undernames - +b.undernames
                  : +b.undernames - +a.undernames,
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
            className="flex-row pointer grey "
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('expiration')}
          >
            <span>Expiry Date</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'expiration' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'expiration' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'expiration',
        key: 'expiration',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        render: (val: Date | string) =>
          typeof val === 'string' ? val : `${val.toLocaleDateString()}`,
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<PDNSTableRow>({
                key: 'expiration',
                isAsc: sortAscending,
                rows,
              });
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
        render: (val: number) => <TransactionStatus confirmations={val} />,
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
        // eslint-disable-next-line
        render: (val: any, record: PDNSTableRow) => (
          <button
            className="outline-button center pointer"
            style={{
              padding: '6px 10px',
              fontSize: '14px',
              minWidth: 'fit-content',
            }}
            onClick={() => {
              setLoadingManageDomain(record.name);
              navigate(`/manage/names/${record.name}`, {
                state: { from: '/manage/names' },
              });
            }}
          >
            Details
          </button>
        ),
        align: 'right',
        width: '10%',
      },
    ];
  }

  async function fetchDomainRow(
    domain: string,
    record: PDNSRecordEntry,
    address: ArweaveTransactionID,
    txConfirmations: number,
  ): Promise<PDNSTableRow | undefined> {
    try {
      const [contractState, confirmations, pendingContractInteractions] =
        await Promise.all([
          arweaveDataProvider
            .getContractState<PDNTContractJSON>(
              new ArweaveTransactionID(record.contractTxId),
              address,
            )
            .catch((e) => console.error(e)),
          txConfirmations,
          arweaveDataProvider
            .getPendingContractInteractions(
              new ArweaveTransactionID(record.contractTxId),
              address.toString(),
            )
            .catch((e) => {
              console.error(e);
            }),
        ]);

      if (!contractState) {
        throw Error(
          `Failed to load contract: ${record.contractTxId.toString()}`,
        );
      }

      const contract = new PDNTContract(
        contractState,
        new ArweaveTransactionID(record.contractTxId),
      );

      // simple check that it is ANT shaped contract
      if (!contract.isValid()) {
        throw new Error(`Invalid contract: ${record.contractTxId.toString()}`);
      }

      const rowData = {
        name: decodeDomainToASCII(domain),
        id: record.contractTxId,
        role:
          contract.owner === walletAddress?.toString()
            ? 'Owner'
            : contractState.controller === walletAddress?.toString()
            ? 'Controller'
            : 'N/A',
        expiration: record.endTimestamp
          ? new Date(record.endTimestamp * 1000)
          : 'Indefinite',
        status: confirmations ?? 0,
        undernames: record?.undernames ?? DEFAULT_MAX_UNDERNAMES,
        key: `${domain}-${record.contractTxId}`,
      };
      const pendingTxsForContract = getPendingInteractionsRowsForContract(
        pendingContractInteractions ?? [],
        rowData,
      );

      const pendingInteractions = pendingTxsForContract.reduce(
        (pendingValues, i) => ({
          ...pendingValues,
          [i.attribute]: i.value,
        }),
        {},
      );

      // TODO: add error messages and reload state to row
      return {
        ...rowData,
        ...pendingInteractions,
        hasPending: !!pendingTxsForContract.length,
      };
    } catch (error) {
      console.error(error);
    } finally {
      setPercentLoaded(((itemsLoaded + 1) / itemCount) * 100);
      setItemsLoaded(itemsLoaded + 1);
    }
  }

  function buildFakeRecord(cachedRecord: ContractInteraction) {
    const record: PDNSRecordEntry = {
      type:
        cachedRecord.payload.type === TRANSACTION_TYPES.LEASE
          ? TRANSACTION_TYPES.LEASE
          : TRANSACTION_TYPES.BUY,
      contractTxId:
        cachedRecord.payload.contractTxId === 'atomic'
          ? cachedRecord.id
          : cachedRecord.payload.contractTxId,
      startTimestamp: Math.round(cachedRecord.timestamp / 1000),
      endTimestamp:
        cachedRecord.type === TRANSACTION_TYPES.LEASE
          ? cachedRecord.timestamp +
            +cachedRecord.payload.years * YEAR_IN_MILLISECONDS
          : undefined,
      undernames: DEFAULT_MAX_UNDERNAMES,
    };
    return record;
  }

  async function fetchDomainRows(
    ids: ArweaveTransactionID[],
    address: ArweaveTransactionID,
  ) {
    setIsLoading(true);
    const fetchedRows: PDNSTableRow[] = [];
    const tokenIds = new Set(ids);

    try {
      const cachedInteractions =
        await arweaveDataProvider.getPendingContractInteractions(
          new ArweaveTransactionID(PDNS_REGISTRY_ADDRESS),
          address.toString(),
        );
      const cachedRegistrations = cachedInteractions.reduce(
        (acc: PDNSDomains, interaction) => {
          if (interaction.payload?.function === 'buyRecord') {
            acc[interaction.payload.name] = buildFakeRecord(interaction);
            tokenIds.add(
              new ArweaveTransactionID(
                interaction.payload.contractTxId === 'atomic'
                  ? interaction.id
                  : interaction.payload.contractTxId,
              ),
            );
          }
          return acc;
        },
        {},
      );

      const consolidatedRecords = Object.entries({
        ...cachedRegistrations,
        ...pdnsSourceContract.records,
      });
      const confirmations = await arweaveDataProvider.getTransactionStatus(
        [...tokenIds],
        blockHeight,
      );
      setItemCount(consolidatedRecords.length);
      const rowData = await Promise.all(
        [...tokenIds].map((id: ArweaveTransactionID) => {
          const record = consolidatedRecords.find(
            ([, record]) => record.contractTxId === id.toString(),
          );
          if (record) {
            return fetchDomainRow(
              record[0],
              record[1],
              address,
              confirmations[record[1].contractTxId],
            );
          }
        }),
      ).then((rows) =>
        rows.reduce((acc: PDNSTableRow[], row) => {
          if (row) {
            acc.push(row);
          }
          return acc;
        }, []),
      );
      fetchedRows.push(...rowData);
      // sort by confirmations by default
      fetchedRows.sort((a, b) => a.status - b.status);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsLoading(false);
    }

    setRows(fetchedRows);
  }

  return {
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows,
    sortField,
    sortAscending,
    selectedRow,
    loadingManageDomain,
  };
}
