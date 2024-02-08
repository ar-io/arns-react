import ManageAssetButtons from '@src/components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import {
  ChevronUpIcon,
  CirclePending,
  CircleXFilled,
  ExternalLinkIcon,
  SearchIcon,
} from '../../components/icons/index';
import ValidationInput from '../../components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import TransactionStatus from '../../components/layout/TransactionStatus/TransactionStatus';
import { ANTContract } from '../../services/arweave/ANTContract';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import {
  ANTContractJSON,
  ARNSRecordEntry,
  ARNSTableRow,
  ContractInteraction,
} from '../../types';
import {
  decodeDomainToASCII,
  formatDate,
  getUndernameCount,
  handleTableSort,
} from '../../utils';
import { DEFAULT_MAX_UNDERNAMES } from '../../utils/constants';
import eventEmitter from '../../utils/events';

type DomainData = {
  record: ARNSRecordEntry & { domain: string };
  state?: ANTContractJSON;
  transactionBlockHeight?: number;
  pendingContractInteractions?: ContractInteraction[];
  errors?: string[];
};

export function useWalletDomains() {
  const [{ gateway, blockHeight, arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortAscending] = useState(true);
  const [sortField, setSortField] = useState<keyof ARNSTableRow>('status');
  const [selectedRow] = useState<ARNSTableRow>();
  const [rows, setRows] = useState<ARNSTableRow[]>([]);
  const [filteredResults, setFilteredResults] = useState<ARNSTableRow[]>([]);
  // loading info
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const itemCount = useRef<number>(0);
  const itemsLoaded = useRef<number>(0);
  const [percent, setPercentLoaded] = useState<number | undefined>();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { path } = useParams();

  if (searchRef.current && searchOpen) {
    searchRef.current.focus();
  }

  useEffect(() => {
    load();
  }, [walletAddress]);

  useEffect(() => {
    const searchQuery = searchParams.get('search');

    if (searchQuery || searchText) {
      if (searchText !== searchQuery) {
        setSearchParams(searchText ? { search: searchText } : {});
      }
      if (searchQuery && !searchText && !searchOpen) {
        setSearchText(searchQuery);
        setSearchOpen(true);
      }
      if (!rows) {
        return;
      }
      const filtered = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(searchText.toLowerCase()) ||
          row.id.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  }, [searchText, rows, path]);

  function sortRows(key: keyof ARNSTableRow, isAsc: boolean): void {
    setSortField(key);
    const newRows = [...rows];
    handleTableSort<ARNSTableRow>({
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
        render: (val: string) => val,
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
        render: (val: number, row: ARNSTableRow) => (
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
        title: (
          <div
            className="flex flex-row center undername-search-wrapper"
            style={{
              gap: '1px',
              justifyContent: 'flex-end',
              boxSizing: 'border-box',
            }}
          >
            <button
              className="flex button center pointer"
              style={{ zIndex: 10 }}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <SearchIcon
                width={'16px'}
                height={'16px'}
                fill={searchOpen ? 'var(--text-white)' : 'var(--text-grey)'}
              />
            </button>
            {searchOpen ? (
              <span
                className="flex flex-row center"
                style={{
                  gap: '1px',
                  justifyContent: 'flex-end',
                  width: 'fit-content',
                  boxSizing: 'border-box',
                }}
              >
                <ValidationInput
                  ref={searchRef}
                  value={searchText}
                  setValue={(e) => setSearchText(e)}
                  catchInvalidInput={true}
                  showValidationIcon={false}
                  placeholder={'Search for a name'}
                  maxCharLength={63}
                  wrapperCustomStyle={{
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                  inputCustomStyle={{
                    width: '100%',
                    minWidth: '120px',
                    overflow: 'hidden',
                    fontSize: '13px',
                    outline: 'none',
                    color: 'white',
                    alignContent: 'center',
                    borderBottom: 'none',
                    boxSizing: 'border-box',
                    background: 'transparent',
                    borderRadius: 'var(--corner-radius)',
                    border: 'none',
                    paddingRight: '10px',
                  }}
                  validationPredicates={{}}
                />
                <button
                  className="flex button center pointer"
                  onClick={() => {
                    setSearchText('');
                    setSearchParams({});
                    setSearchOpen(false);
                  }}
                >
                  <CircleXFilled
                    width={'18px'}
                    height={'18px'}
                    fill={'var(--text-grey)'}
                  />
                </button>
              </span>
            ) : (
              <></>
            )}
          </div>
        ),
        className: 'white manage-assets-table-header',
        // eslint-disable-next-line
        render: (val: any, record: ARNSTableRow) => (
          <span className="flex" style={{ justifyContent: 'flex-end' }}>
            <ManageAssetButtons
              id={record.name}
              assetType="names"
              disabled={!record.status}
            />
          </span>
        ),
        align: 'right',
        width: '20%',
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
        await arweaveDataProvider.getRecords<ARNSRecordEntry>({
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
        const [contract, pendingContractInteractions] = await Promise.all([
          arweaveDataProvider
            .buildANTContract(new ArweaveTransactionID(record.contractTxId))
            .catch((e) => console.error(e)),
          arweaveDataProvider
            .getPendingContractInteractions(
              new ArweaveTransactionID(record.contractTxId),
            )
            .catch((e) => {
              console.error(e);
            }),
        ]);

        if (!contract?.state) {
          errors.push(
            `Failed to load contract: ${record.contractTxId.toString()}`,
          );
        }
        // simple check that it is ANT shaped contract

        if (!contract?.isValid()) {
          errors.push(`Invalid contract: ${record.contractTxId.toString()}`);
        }
        // TODO: react strict mode makes this increment twice in dev
        if (itemsLoaded.current < itemCount.current) itemsLoaded.current++;
        setPercentLoaded(
          Math.round((itemsLoaded.current / itemCount.current) * 100),
        );
        if (!contract?.getOwnershipStatus(walletAddress)) {
          return;
        }

        const data: DomainData = {
          record,
          state: contract?.state,
          pendingContractInteractions: pendingContractInteractions ?? undefined,
          transactionBlockHeight:
            allTransactionBlockHeights?.[record.contractTxId.toString()]
              ?.blockHeight,
          errors,
        };

        return data;
      });

      datas = (await Promise.all(newDatas)).filter(
        (data) => !!data,
      ) as DomainData[];
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
    const fetchedRows: ARNSTableRow[] = [];

    try {
      const rowData = datas.map((data: DomainData) => {
        const { record, state, transactionBlockHeight } = data;
        const contract = new ANTContract(
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
            ? formatDate(record.endTimestamp * 1000)
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
    handleTableSort<ARNSTableRow>({
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
    rows: searchText.length && searchOpen ? filteredResults : rows,
    sortField,
    sortAscending,
    selectedRow,
    refresh: load,
  };
}
