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
import { PDNTContract } from '../../services/arweave/PDNTContract';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import {
  ArweaveTransactionID,
  ContractInteraction,
  PDNSRecordEntry,
  PDNSTableRow,
  PDNTContractJSON,
} from '../../types';
import {
  decodeDomainToASCII,
  getUndernameCount,
  handleTableSort,
} from '../../utils';
import { DEFAULT_MAX_UNDERNAMES } from '../../utils/constants';
import eventEmitter from '../../utils/events';

type DomainData = {
  record: PDNSRecordEntry & { domain: string };
  state?: PDNTContractJSON;
  transactionBlockHeight?: number;
  pendingContractInteractions?: ContractInteraction[];
  errors?: string[];
};

export function useWalletDomains() {
  const [{ gateway, blockHeight, arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortAscending] = useState(true);
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
    load();
  }, [walletAddress]);

  function sortRows(key: keyof PDNSTableRow, isAsc: boolean): void {
    setSortField(key);
    const newRows = [...rows];
    handleTableSort<PDNSTableRow>({
      key,
      isAsc,

      rows: newRows,
    });
    setRows([...newRows]);
  }

  async function load() {
    try {
      setIsLoading(true);
      if (walletAddress) {
        const height =
          blockHeight ?? (await arweaveDataProvider.getCurrentBlockHeight());
        const { contractTxIds } =
          await arweaveDataProvider.getContractsForWallet(
            walletAddress,
            'ant', // only fetches contracts that have a state that matches ant spec
          );
        const data = await fetchDomainData(
          contractTxIds,
          walletAddress,
          height,
        );
        const newRows = buildDomainRows(data, walletAddress, height);
        setRows(newRows);
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
            onClick={() => {
              if (sortField == 'name') {
                setSortAscending(!sortAscending);
              }
              sortRows('name', !sortAscending);
            }}
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
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'role') {
                setSortAscending(!sortAscending);
              }
              sortRows('role', !sortAscending);
            }}
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
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'id') {
                setSortAscending(!sortAscending);
              }
              sortRows('id', !sortAscending);
            }}
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
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'undernames') {
                setSortAscending(!sortAscending);
              }
              sortRows('undernames', !sortAscending);
            }}
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
      },
      {
        title: (
          <button
            className="flex-row pointer grey "
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'expiration') {
                setSortAscending(!sortAscending);
              }
              sortRows('expiration', !sortAscending);
            }}
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
          typeof val === 'string' ? val : `${val?.toLocaleDateString()}`,
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'status') {
                setSortAscending(!sortAscending);
              }
              sortRows('status', !sortAscending);
            }}
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
        render: (val: number, row: PDNSTableRow) => (
          <TransactionStatus
            confirmations={val}
            errorMessage={
              !val && !row.hasPending && val !== 0
                ? row.errors
                  ? row.errors?.join(', ')
                  : 'Unable to get confirmations for ANT Contract'
                : undefined
            }
          />
        ),
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
      const registrations =
        await arweaveDataProvider.getRecords<PDNSRecordEntry>({
          filters: { contractTxId: [...tokenIds] },
          address,
        });
      const consolidatedRecords = Object.entries(registrations).map(
        ([domain, record]) => ({ ...record, domain }),
      );
      const allTransactionBlockHeights = await arweaveDataProvider
        .getTransactionStatus([...tokenIds], currentBlockHeight)
        .catch((e) => console.error(e));

      itemCount.current = consolidatedRecords.length;

      const newDatas = consolidatedRecords.map(async (record) => {
        const errors = [];
        const [contractState, pendingContractInteractions] = await Promise.all([
          arweaveDataProvider
            .getContractState<PDNTContractJSON>(
              new ArweaveTransactionID(record.contractTxId),
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
          transactionBlockHeight:
            allTransactionBlockHeights?.[record.contractTxId.toString()]
              ?.blockHeight,
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

  function buildDomainRows(
    datas: DomainData[],
    address: ArweaveTransactionID,
    currentBlockHeight?: number,
  ) {
    const fetchedRows: PDNSTableRow[] = [];

    try {
      const rowData = datas.map((data: DomainData) => {
        const { record, state, transactionBlockHeight } = data;
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
            transactionBlockHeight && currentBlockHeight
              ? currentBlockHeight - transactionBlockHeight
              : 0,
          undernameSupport: record?.undernames ?? DEFAULT_MAX_UNDERNAMES,
          undernameCount: getUndernameCount(contract.records),
          undernames: `${getUndernameCount(
            contract.records,
          ).toLocaleString()} / ${(
            record?.undernames ?? DEFAULT_MAX_UNDERNAMES
          ).toLocaleString()}`,
          key: `${record.domain}-${record.contractTxId}`,
          hasPending: !!data.pendingContractInteractions?.length,
          errors: data.errors,
        };
      });
      fetchedRows.push(...rowData);
    } catch (error) {
      eventEmitter.emit('error', error);
    }
    handleTableSort<PDNSTableRow>({
      key: 'status',
      isAsc: false,
      rows: fetchedRows,
    });
    return fetchedRows;
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
