import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
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
  getUndernameCount,
  handleTableSort,
} from '../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  DEFAULT_MAX_UNDERNAMES,
  YEAR_IN_MILLISECONDS,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';

type DomainData = {
  record: PDNSRecordEntry & { domain: string };
  state?: PDNTContractJSON;
  blockHeight?: number;
  pendingContractInteractions?: ContractInteraction[];
  errors?: string[];
};

export function useWalletDomains() {
  const [{ gateway, blockHeight }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [domainData, setDomainData] = useState<DomainData[]>([]);
  const { walletAddress } = useWalletAddress();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof PDNSTableRow>('status');
  const [selectedRow] = useState<PDNSTableRow>();
  const [rows, setRows] = useState<PDNSTableRow[]>([]);
  // loading info
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemCount = useRef<number>(0);
  const itemsLoaded = useRef<number>(0);
  const [percent, setPercentLoaded] = useState<number | undefined>();
  const [loadingManageDomain, setLoadingManageDomain] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    if (walletAddress) {
      if (!domainData.length) {
        load();
        return;
      }
      fetchDomainRows(domainData, walletAddress, blockHeight);
    }
  }, [domainData, blockHeight]);

  async function load() {
    try {
      setIsLoading(true);
      if (walletAddress) {
        const { contractTxIds } =
          await arweaveDataProvider.getContractsForWallet(
            walletAddress,
            'ant', // only fetches contracts that have a state that matches ant spec
          );
        const data = await fetchDomainData(
          contractTxIds,
          walletAddress,
          blockHeight,
        );
        setDomainData(data);
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
        render: (undernames: number | string) => undernames,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: PDNSTableRow, b: PDNSTableRow) =>
                sortAscending
                  ? +a.undernameSupport - +b.undernameSupport
                  : +b.undernameSupport - +a.undernameSupport,
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
        render: (val?: number) => (
          <TransactionStatus
            confirmations={val ?? 0}
            errorMessage={
              !val ? 'Unable to get confirmations for contract' : undefined
            }
          />
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a, b) =>
                sortAscending
                  ? (a.status ?? 1) - (b.status ?? 1)
                  : (b.status ?? 1) - (a.status ?? 1),
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
              padding: '8px 12px',
              fontSize: '11px',
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
            Math.max(1, +cachedRecord.payload.years) * YEAR_IN_MILLISECONDS
          : undefined,
      undernames: DEFAULT_MAX_UNDERNAMES,
    };
    return record;
  }
  async function fetchDomainData(
    ids: ArweaveTransactionID[],
    address: ArweaveTransactionID,
    currentBlockHeight?: number,
  ): Promise<DomainData[]> {
    setPercentLoaded(0);
    itemsLoaded.current = 0;
    const tokenIds = new Set(ids);
    let datas: DomainData[] = [];

    try {
      const cachedInteractions =
        await arweaveDataProvider.getPendingContractInteractions(
          new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
          address.toString(),
        );
      const cachedRegistrations = cachedInteractions.reduce(
        (acc: PDNSDomains, interaction) => {
          if (
            interaction.payload?.function === 'buyRecord' &&
            !interaction?.payload?.auction
          ) {
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
      const registrations = await arweaveDataProvider.getRecords({
        filters: { contractTxId: [...tokenIds] },
      });
      const consolidatedRecords = Object.entries({
        ...cachedRegistrations,
        ...registrations,
      }).reduce(
        (
          acc: Array<PDNSRecordEntry & { domain: string }>,
          [domain, record],
        ) => {
          acc.push({ ...record, domain });
          return acc;
        },
        [],
      );
      const allBlockHeights = await arweaveDataProvider
        .getTransactionStatus([...tokenIds], currentBlockHeight)
        .catch((e) => console.error(e));

      itemCount.current = consolidatedRecords.length;

      const newDatas = consolidatedRecords.map(async (record) => {
        const errors = [];
        const [contractState, pendingContractInteractions] = await Promise.all([
          arweaveDataProvider
            .getContractState<PDNTContractJSON>(
              new ArweaveTransactionID(record.contractTxId),
              address,
            )
            .catch((e) => console.error(e)),
          arweaveDataProvider
            .getPendingContractInteractions(
              new ArweaveTransactionID(record.contractTxId),
              address.toString(),
            )
            .catch((e) => {
              console.error(e);
            }),
        ]);

        const contract = new PDNTContract(
          contractState ?? undefined,
          new ArweaveTransactionID(record.contractTxId),
        );
        if (!contractState) {
          errors.push(
            `Failed to load contract: ${record.contractTxId.toString()}`,
          );
        }
        // simple check that it is ANT shaped contract
        if (!contract.isValid()) {
          errors.push(`Invalid contract: ${record.contractTxId.toString()}`);
        }
        // TODO: react strict mode makes this increment twice in dev
        if (itemsLoaded.current < itemCount.current) itemsLoaded.current++;
        setPercentLoaded(
          Math.round((itemsLoaded.current / itemCount.current) * 100),
        );

        const data: DomainData = {
          record,
          state: contractState ?? undefined,
          pendingContractInteractions: pendingContractInteractions ?? undefined,
          blockHeight:
            allBlockHeights?.[record.contractTxId.toString()].blockHeight,
          errors,
        };

        return data;
      });

      datas = await Promise.all(newDatas);
    } catch (error) {
      console.error(error);
    }
    return datas;
  }

  function fetchDomainRows(
    datas: DomainData[],
    address: ArweaveTransactionID,
    currentBlockHeight?: number,
  ) {
    const fetchedRows: PDNSTableRow[] = [];

    try {
      const rowData = datas.map((data: DomainData) => {
        const { record, state, blockHeight } = data;
        const contract = new PDNTContract(
          state,
          new ArweaveTransactionID(record.contractTxId),
        );

        return {
          name: decodeDomainToASCII(data.record.domain),
          id: data.record.contractTxId,
          role:
            contract.owner === walletAddress?.toString()
              ? 'Owner'
              : contract.controllers.includes(address.toString())
              ? 'Controller'
              : 'N/A',
          expiration: record.endTimestamp
            ? new Date(record.endTimestamp * 1000)
            : 'Indefinite',
          status:
            blockHeight && currentBlockHeight
              ? currentBlockHeight - blockHeight
              : undefined,
          undernameSupport: record?.undernames ?? DEFAULT_MAX_UNDERNAMES,
          undernameCount: getUndernameCount(contract.records),
          undernames: `${getUndernameCount(
            contract.records,
          ).toLocaleString()} / ${(
            record?.undernames ?? DEFAULT_MAX_UNDERNAMES
          ).toLocaleString()}`,
          key: `${record.domain}-${record.contractTxId}`,
          hasPending: !!data.pendingContractInteractions?.length,
        };
      });
      fetchedRows.push(...rowData);
      // sort by confirmations by default
      fetchedRows.sort((a, b) => (a.status ?? 1) - (b.status ?? 1));
    } catch (error) {
      eventEmitter.emit('error', error);
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
    refresh: load,
  };
}
