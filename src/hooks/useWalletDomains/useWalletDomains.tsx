import { useEffect, useState } from 'react';

import {
  CalendarTimeIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  LinkIcon,
  PersonIcon,
  PriceTagIcon,
  RefreshAlertIcon,
} from '../../components/icons/index';
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
import { decodeDomainToASCII, handleTableSort } from '../../utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  PDNS_REGISTRY_ADDRESS,
  YEAR_IN_MILLISECONDS,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';

export function useWalletDomains(ids: ArweaveTransactionID[]) {
  const [{ gateway, pdnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof PDNSTableRow>('status');
  const [selectedRow] = useState<PDNSTableRow>();
  const [rows, setRows] = useState<PDNSTableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [percent, setPercentLoaded] = useState<number | undefined>();

  useEffect(() => {
    if (ids.length) {
      0;
      fetchDomainRows(ids, walletAddress!);
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
              fill={'var(--text-grey)'}
              style={
                sortField === 'name' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Name</span>
            <LinkIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'icon-padding white assets-table-header',
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
            <PersonIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'role',
        key: 'role',
        width: '18%',
        align: 'center',
        className: 'white assets-table-header',
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
            <span>Undernames</span>
            <PriceTagIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'undernames',
        key: 'undernames',
        width: '18%',
        className: 'white assets-table-header',
        align: 'center',
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
            className="flex-row pointer white center"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('expiration')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'expiration' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Expiry Date</span>
            <CalendarTimeIcon
              width={24}
              height={24}
              fill={'var(--text-grey)'}
            />
          </button>
        ),
        dataIndex: 'expiration',
        key: 'expiration',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
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
        render: () => (
          <button
            className="white center"
            onClick={() => alert('coming soon!')}
          >
            &#x2022;&#x2022;&#x2022;
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
  ): Promise<PDNSTableRow | undefined> {
    try {
      const [contractState, confirmations] = await Promise.all([
        arweaveDataProvider
          .getContractState<PDNTContractJSON>(
            new ArweaveTransactionID(record.contractTxId),
            address,
          )
          .catch((e) => console.error(e)),
        arweaveDataProvider
          .getTransactionStatus(new ArweaveTransactionID(record.contractTxId))
          .catch((e) => console.error(e)),
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

      // TODO: add error messages and reload state to row
      return {
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
    } catch (error) {
      console.error(error);
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
      const rowData = await Promise.all(
        [...tokenIds].map((id: ArweaveTransactionID) => {
          const record = consolidatedRecords.find(
            ([, record]) => record.contractTxId === id.toString(),
          );
          if (record) {
            return fetchDomainRow(record[0], record[1], address);
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
      setPercentLoaded(((fetchedRows?.length + 1) / tokenIds.size) * 100);
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
    selectedRow,
  };
}
