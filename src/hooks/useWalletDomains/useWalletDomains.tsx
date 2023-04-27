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
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  PdnsRecordEntry,
  PdnsTableRow,
} from '../../types';
import eventEmitter from '../../utils/events';

export function useWalletDomains(ids: ArweaveTransactionID[]) {
  const [{ gateway, pdnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof PdnsTableRow>('status');
  const [selectedRow, setSelectedRow] = useState<PdnsTableRow>(); // eslint-disable-line
  const [rows, setRows] = useState<PdnsTableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number | undefined>();

  useEffect(() => {
    if (ids.length) {
      setIsLoading(true);
      fetchPdntRows(ids).finally(() => setIsLoading(false));
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
            <span>Name</span>
            <LinkIcon width={24} height={24} fill={'var(--text-faded)'} />
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'icon-padding white',
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
              rows.sort((a: PdnsTableRow, b: PdnsTableRow) =>
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
            <PersonIcon width={24} height={24} fill={'var(--text-faded)'} />
          </button>
        ),
        dataIndex: 'role',
        key: 'role',
        width: '18%',
        align: 'center',
        className: 'white',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PdnsTableRow, b: PdnsTableRow) =>
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
            <span>Tier</span>
            <PriceTagIcon width={24} height={24} fill={'var(--text-faded)'} />
          </button>
        ),
        dataIndex: 'tier',
        key: 'tier',
        width: '18%',
        className: 'white',
        align: 'center',
        ellipsis: true,
        render: (tier: number | string) => `Tier ${tier}`,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PdnsTableRow, b: PdnsTableRow) =>
                sortAscending ? +a.tier - +b.tier : +b.tier - +a.tier,
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
              fill={'var(--text-faded)'}
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
              fill={'var(--text-faded)'}
            />
          </button>
        ),
        dataIndex: 'expiration',
        key: 'expiration',
        align: 'center',
        width: '18%',
        className: 'white',
        render: (val: Date) => `${val.toLocaleDateString()}`,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PdnsTableRow, b: PdnsTableRow) =>
                sortAscending
                  ? a.expiration.getTime() - b.expiration.getTime()
                  : b.expiration.getTime() - a.expiration.getTime(),
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

  async function fetchPdntRows(ids: ArweaveTransactionID[]) {
    const { records } = pdnsSourceContract;

    const fetchedRows: PdnsTableRow[] = [];
    for (const [index, txId] of ids.entries()) {
      try {
        const associatedNames: (PdnsRecordEntry & { name: string })[] =
          Object.entries(records)
            .map(([name, recordEntry]: [string, PdnsRecordEntry]) => {
              if (recordEntry.contractTxId === txId.toString()) {
                return {
                  ...recordEntry,
                  name,
                };
              }
            })
            .filter((n) => !!n) as (PdnsRecordEntry & { name: string })[];
        const [contractState, confirmations] = await Promise.all([
          arweaveDataProvider.getContractState<PDNTContractJSON>(txId),
          arweaveDataProvider.getTransactionStatus(txId),
        ]);
        // TODO: add error messages and reload state to row
        const rowData = associatedNames.map((domain) => ({
          name: domain.name,
          id: txId.toString(),
          role:
            contractState.owner.toString() === walletAddress?.toString()
              ? 'Owner'
              : contractState.controller === walletAddress?.toString()
              ? 'Controller'
              : 'N/A',
          expiration: new Date(domain.endTimestamp * 1000),
          status: confirmations ?? 0,
          tier:
            Object.keys(pdnsSourceContract.tiers.current).find(
              (k: string) =>
                pdnsSourceContract.tiers.current[+k] === domain.tier,
            ) ?? 1,
          key: `${domain.name}-${txId.toString()}`,
        }));
        fetchedRows.push(...rowData);
      } catch (error) {
        eventEmitter.emit('error', error);
      } finally {
        // sort by confirmations by default
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
