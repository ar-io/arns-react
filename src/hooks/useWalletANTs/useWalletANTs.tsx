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
import ManageAssetButtons from '../../components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import ValidationInput from '../../components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import TransactionStatus from '../../components/layout/TransactionStatus/TransactionStatus';
import { ANTContract } from '../../services/arweave/ANTContract';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import { ANTMetadata, ContractInteraction } from '../../types';
import { handleTableSort, isArweaveTransactionID } from '../../utils';
import eventEmitter from '../../utils/events';

type ANTData = {
  contract: ANTContract;
  transactionBlockHeight?: number;
  pendingContractInteractions?: ContractInteraction[];
  errors?: string[];
};

export function useWalletANTs() {
  const [{ blockHeight, arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [sortField, setSortField] = useState<keyof ANTMetadata>('status');
  const [rows, setRows] = useState<ANTMetadata[]>([]);
  const [filteredResults, setFilteredResults] = useState<ANTMetadata[]>([]);

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
          row.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          row.state.ticker?.toLowerCase().includes(searchText.toLowerCase()) ||
          row.id?.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  }, [searchText, rows, path]);

  function sortRows(key: keyof ANTMetadata, isAsc: boolean): void {
    setSortField(key);
    const newRows = [...rows];
    handleTableSort<ANTMetadata>({
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
        const data = await fetchANTData(contractTxIds, height);
        const newRows = buildANTRows(data, walletAddress, height);
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
        align: 'left',
        width: '18%',
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
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'targetID') {
                setSortAscending(!sortAscending);
              }
              sortRows('name', !sortAscending);
            }}
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
          !isArweaveTransactionID(val) ? (
            val
          ) : (
            <ArweaveID
              id={new ArweaveTransactionID(val)}
              characterCount={12}
              shouldLink
              type={ArweaveIdTypes.TRANSACTION}
            />
          ),
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
        render: (val: number, row: ANTMetadata) => (
          <TransactionStatus
            confirmations={val}
            errorMessage={
              !val && !row.hasPending && val !== 0
                ? row.errors?.length
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
                  placeholder={'Search for an ANT'}
                  wrapperCustomStyle={{
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                  inputCustomStyle={{
                    width: '100%',
                    minWidth: '130px',
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
        render: (val: any, row: ANTMetadata) => (
          <span className="flex" style={{ justifyContent: 'flex-end' }}>
            <ManageAssetButtons
              id={val.id}
              assetType="ants"
              disabled={!row.state || !row.status}
            />
          </span>
        ),
        align: 'right',
        width: '20%',
      },
    ];
  }

  async function fetchANTData(
    contractTxIds: ArweaveTransactionID[],
    currentBlockHeight?: number,
  ): Promise<ANTData[]> {
    let datas: ANTData[] = [];
    try {
      itemsLoaded.current = 0;
      const tokenIds: Set<ArweaveTransactionID> = new Set(contractTxIds);

      itemCount.current = tokenIds.size;

      const allTransactionBlockHeights = await arweaveDataProvider
        .getTransactionStatus([...tokenIds], currentBlockHeight)
        .catch((e) => console.error(e));
      const newDatas = [...tokenIds].map(
        async (contractTxId: ArweaveTransactionID) => {
          const errors = [];
          const [contract, confirmations, pendingContractInteractions] =
            await Promise.all([
              arweaveDataProvider.buildANTContract(contractTxId),
              allTransactionBlockHeights
                ? allTransactionBlockHeights[contractTxId.toString()]
                    ?.blockHeight
                : 0,
              arweaveDataProvider.getPendingContractInteractions(contractTxId),
            ]);

          if (!contract.state) {
            errors.push(`Failed to load contract: ${contractTxId.toString()}`);
          }

          // simple check that it is ANT shaped contract
          if (!contract.isValid()) {
            errors.push('Invalid contract');
          }

          // TODO: react strict mode makes this increment twice in dev
          if (itemsLoaded.current < itemCount.current) itemsLoaded.current++;

          setPercentLoaded(
            Math.round((itemsLoaded.current / itemCount.current) * 100),
          );
          if (!contract.getOwnershipStatus(walletAddress)) {
            return;
          }

          return {
            contract,
            status: confirmations ?? 0,
            transactionBlockHeight: allTransactionBlockHeights?.[
              contractTxId.toString()
            ]?.blockHeight
              ? allTransactionBlockHeights[contractTxId.toString()].blockHeight
              : 0,
            pendingContractInteractions,
            errors,
          } as ANTData;
        },
      );

      datas = (await Promise.all(newDatas)).filter((d) => !!d) as ANTData[];
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

      const rowData = {
        name: contract.name ?? 'N/A',
        id: contract.id?.toString() ?? 'N/A',
        role:
          contract.owner === address.toString()
            ? 'Owner'
            : contract.controllers.includes(address.toString())
            ? 'Controller'
            : 'N/A',
        targetID: isArweaveTransactionID(contract.getRecord('@')?.transactionId)
          ? contract.getRecord('@')!.transactionId.toString()
          : 'N/A',
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
    handleTableSort<ANTMetadata>({
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
    refresh: load,
  };
}
