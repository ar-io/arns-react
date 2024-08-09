import { AoANTState, AoArNSNameData, isLeasedArNSRecord } from '@ar.io/sdk/web';
import RegistrationTip from '@src/components/data-display/RegistrationTip';
import ManageAssetButtons from '@src/components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { dispatchArNSUpdate } from '@src/state/actions/dispatchArNSUpdate';
import { useArNSState } from '@src/state/contexts/ArNSState';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import {
  ChevronUpIcon,
  CircleXFilled,
  ExternalLinkIcon,
  SearchIcon,
} from '../../components/icons/index';
import ValidationInput from '../../components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import { ARNSTableRow, DomainDetails } from '../../types';
import {
  decodeDomainToASCII,
  formatDate,
  handleTableSort,
  lowerCaseDomain,
} from '../../utils';
import { DEFAULT_MAX_UNDERNAMES } from '../../utils/constants';
import eventEmitter from '../../utils/events';

export function useWalletDomains() {
  const [{ gateway, ioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortAscending] = useState(true);
  const [sortField, setSortField] =
    useState<keyof ARNSTableRow>('startTimestamp');
  const [selectedRow] = useState<ARNSTableRow>();
  const [rows, setRows] = useState<ARNSTableRow[]>([]);
  const [filteredResults, setFilteredResults] = useState<ARNSTableRow[]>([]);
  // loading info
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { path } = useParams();
  const [
    { domains, ants, loading, percentLoaded, arnsEmitter },
    dispatchArNSState,
  ] = useArNSState();

  if (searchRef.current && searchOpen) {
    searchRef.current.focus();
  }

  useEffect(() => {
    load();
  }, [walletAddress, domains]);

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
      if (walletAddress && domains && ants) {
        const newRows = buildDomainRows({
          domains,
          ants,
        });
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
        width: '25%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
        render: (name: string) => (
          <a
            className="link"
            target="_blank"
            href={`https://${decodeDomainToASCII(name)}.${
              gateway === 'arweave.net' ? 'ar-io.dev' : gateway
            }`}
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
        width: '15%',
        align: 'left',
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
        width: '15%',
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
            className="pointer grey flex-row"
            style={{ gap: '0.5em' }}
            onClick={() => {
              if (sortField == 'undernameLimit') {
                setSortAscending(!sortAscending);
              }
              sortRows('undernameLimit', !sortAscending);
            }}
          >
            <span>Undernames</span>{' '}
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'undernameLimit' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : { display: sortField === 'undernameLimit' ? '' : 'none' }
              }
            />
          </button>
        ),
        dataIndex: 'undernameLimit',
        key: 'undernameLimit',
        width: '18%',
        className: 'white manage-assets-table-header',
        align: 'left',
        ellipsis: true,
        render: (undernameLimit: number | string, row: ARNSTableRow) => {
          return (
            <Link
              to={`/manage/names/${row.name}/upgrade-undernames`}
              className="link hover"
            >
              {undernameLimit} / {row.undernameSupport}
            </Link>
          );
        },
      },
      {
        title: (
          <button
            className="pointer grey flex-row"
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
        render: (_: any, row: DomainDetails) => {
          return <RegistrationTip domain={domains[row.name]} />;
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

        render: (_: any, record: ARNSTableRow) => (
          <span className="flex" style={{ justifyContent: 'flex-end' }}>
            <ManageAssetButtons
              id={lowerCaseDomain(record.name)}
              assetType="names"
              disabled={false}
            />
          </span>
        ),
        align: 'right',
        width: '5%',
      },
    ];
  }

  function buildDomainRows({
    domains,
    ants,
  }: {
    domains: Record<string, AoArNSNameData>;
    ants: Record<string, AoANTState>;
  }) {
    const fetchedRows: ARNSTableRow[] = [];

    try {
      const rowData = Object.entries(domains)
        .map(([domain, record]) => {
          const ant = ants[record.processId];
          const { Owner, Controllers, Records, Ticker, Name } = ant;
          if (!Owner || !Controllers || !Records || !Ticker || !Name) {
            return;
          }
          const recordCount = Object.keys(Records).filter(
            (r) => r !== '@',
          ).length;
          return {
            name: decodeDomainToASCII(domain),
            id: record.processId,
            role:
              // TODO: use a utility function in ar.io/sdk
              ant.Owner === walletAddress?.toString()
                ? 'Owner'
                : ant.Controllers?.includes(walletAddress?.toString() ?? '')
                ? 'Controller'
                : 'N/A',
            expiration: isLeasedArNSRecord(record)
              ? formatDate(record.endTimestamp)
              : 'Indefinite',
            startTimestamp: record.startTimestamp,
            undernameSupport: record?.undernameLimit ?? DEFAULT_MAX_UNDERNAMES,
            undernameLimit: recordCount,
            undernameCount: `${recordCount?.toLocaleString()} / ${(
              record?.undernameLimit ?? DEFAULT_MAX_UNDERNAMES
            )?.toLocaleString()}`,
            // is based on registration, we use endTimestamp to sort appropriately
            status: isLeasedArNSRecord(record)
              ? record.endTimestamp
              : 'Indefinite',
            key: `${domain}-${record.processId}`,
            errors: [],
          };
        })
        .filter((r) => r !== undefined) as ARNSTableRow[];
      fetchedRows.push(...rowData);
    } catch (error) {
      eventEmitter.emit('error', error);
    }

    // sort by start timestamp desc by default
    handleTableSort<ARNSTableRow>({
      key: 'startTimestamp',
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
    selectedRow,
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
