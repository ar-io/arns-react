import { isLeasedArNSRecord } from '@ar.io/sdk/web';
import RegistrationTip from '@src/components/data-display/RegistrationTip';
import { dispatchArNSUpdate } from '@src/state/actions/dispatchArNSUpdate';
import { useArNSState } from '@src/state/contexts/ArNSState';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { DEFAULT_TTL_SECONDS } from '@src/utils/constants';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import {
  ChevronUpIcon,
  CircleXFilled,
  SearchIcon,
} from '../../components/icons/index';
import ManageAssetButtons from '../../components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import ValidationInput from '../../components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useWalletState } from '../../state/contexts/WalletState';
import { ANTMetadata } from '../../types';
import { handleTableSort, isArweaveTransactionID } from '../../utils';
import eventEmitter from '../../utils/events';

export function useWalletANTs() {
  const [{ ioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [sortField, setSortField] = useState<keyof ANTMetadata>('status');
  const [rows, setRows] = useState<ANTMetadata[]>([]);
  const [filteredResults, setFilteredResults] = useState<ANTMetadata[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { path } = useParams();
  const [
    { ants, domains, loading, percentLoaded, arnsEmitter },
    dispatchArNSState,
  ] = useArNSState();

  if (searchRef.current && searchOpen) {
    searchRef.current.focus();
  }

  useEffect(() => {
    load();
  }, [walletAddress, ants]);

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
          row.ticker?.toLowerCase().includes(searchText.toLowerCase()) ||
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
      if (walletAddress) {
        const newRows = buildANTRows();
        setRows(newRows);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  function generateTableColumns(): any[] {
    return [
      {
        title: (
          <button
            className="pointer grey flex-row"
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
        width: '25%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
      },
      {
        title: (
          <button
            className="pointer grey flex-row"
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
        width: '15%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
      },
      {
        title: (
          <button
            className="pointer grey flex-row"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'id') {
                setSortAscending(!sortAscending);
              }
              sortRows('id', !sortAscending);
            }}
          >
            <span>Process ID</span>{' '}
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
        width: '20%',
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
            className="pointer grey flex-row"
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
        width: '20%',
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
            className="pointer grey flex-row"
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
        render: (_: any, row: ANTMetadata) => {
          const domain = Object.keys(domains).find(
            (domain) => domains[domain].processId === row.id,
          );
          return (
            <RegistrationTip domain={domain ? domains[domain] : undefined} />
          );
        },
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        width: '10%',
        className: 'white manage-assets-table-header',
      },
      {
        title: (
          <div
            className="center undername-search-wrapper flex flex-row"
            style={{
              gap: '1px',
              justifyContent: 'flex-end',
              boxSizing: 'border-box',
            }}
          >
            <button
              className="button center pointer flex"
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
                className="center flex flex-row"
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
                  className="button center pointer flex"
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
              disabled={row.id == undefined}
            />
          </span>
        ),
        align: 'right',
        width: '10%',
      },
    ];
  }

  function buildANTRows() {
    const fetchedRows: ANTMetadata[] = Object.entries(ants)
      .map(([processId, state], i) => {
        const { Name, Ticker, Owner, Controllers, Records } = state;
        if (!Owner || !Controllers || !Records || !state) {
          return;
        }
        const apexRecord = Records?.['@'];
        const domain = Object.keys(domains).find(
          (domain) => domains[domain].processId === processId,
        );
        const record = domains[domain ?? ''];

        const rowData = {
          name: Name ?? 'N/A',
          id: processId,
          ticker: Ticker ?? 'N/A',
          role:
            Owner === walletAddress?.toString()
              ? 'Owner'
              : Controllers.includes(walletAddress?.toString() ?? '')
                ? 'Controller'
                : 'N/A',
          targetID: apexRecord?.transactionId || 'N/A',
          ttlSeconds: apexRecord?.ttlSeconds || DEFAULT_TTL_SECONDS,
          // status is now based on registration, we use endTimestamp to sort appropriately
          status: isLeasedArNSRecord(record)
            ? record.endTimestamp
            : 'Indefinite',
          hasPending: false,
          errors: [],
          key: i,
        };

        return rowData;
      })
      .filter((row) => row !== undefined) as ANTMetadata[];
    handleTableSort<ANTMetadata>({
      key: 'status',
      isAsc: false,
      rows: fetchedRows,
    });
    return fetchedRows;
  }

  return {
    isLoading: loading,
    percent: percentLoaded,
    columns: generateTableColumns(),
    rows: searchText.length && searchOpen ? filteredResults : rows,
    sortField,
    sortAscending,
    refresh: () => {
      setRows([]);
      setFilteredResults([]);
      if (!walletAddress) return;
      dispatchArNSUpdate({
        dispatch: dispatchArNSState,
        emitter: arnsEmitter,
        walletAddress,
        ioProcessId: ioProcessId,
      });
    },
  };
}
