import { AoArNSNameData, isLeasedArNSRecord } from '@ar.io/sdk/web';
import ManageAssetButtons from '@src/components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

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
import { ARNSTableRow } from '../../types';
import { decodeDomainToASCII, formatDate, handleTableSort } from '../../utils';
import { DEFAULT_MAX_UNDERNAMES } from '../../utils/constants';
import eventEmitter from '../../utils/events';
import useARNS from '../useARNS';

export function useWalletDomains() {
  const [{ gateway }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortAscending] = useState(true);
  const [sortField, setSortField] =
    useState<keyof ARNSTableRow>('startTimestamp');
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
  const { result, invalidate } = useARNS(walletAddress?.toString());

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
        const domainData = await fetchDomainData();
        const newRows = await buildDomainRows(domainData, walletAddress);
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
        render: (undernameLimit: number | string) => undernameLimit,
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
              disabled={false}
            />
          </span>
        ),
        align: 'right',
        width: '20%',
      },
    ];
  }

  async function fetchDomainData(): Promise<
    {
      ant: {
        owner: string;
        controllers: string[];
        name: string;
        ticker: string;
        undernameLimit: number;
      };
      record: AoArNSNameData & { name: string; processId: string };
    }[]
  > {
    setPercentLoaded(0);
    itemsLoaded.current = 0;
    const processIds = new Set(
      Object.values(result.data.domains).map((record: any) => record.processId),
    );
    try {
      const registrations = result.data.domains;
      const consolidatedRecords: { name: string; processId: string }[] =
        Object.entries(registrations).map(([name, record]: any) => ({
          ...record,
          name,
        }));

      // based on # of contracts tied to names, not # of names
      itemCount.current = processIds.size;

      const uniqueAntData = [...processIds].map(
        (processId: ArweaveTransactionID) => {
          // fetch contract information
          const { owner, controllers, name, ticker, totalUndernames } = (
            result.data.ants as any
          )[processId.toString()];

          // TODO: react strict mode makes this increment twice in dev
          if (itemsLoaded.current < itemCount.current) itemsLoaded.current++;
          setPercentLoaded(
            Math.round((itemsLoaded.current / itemCount.current) * 100),
          );

          return {
            processId: processId.toString(),
            owner,
            controllers,
            ticker,
            name,
            undernameLimit: totalUndernames,
          };
        },
      );

      const newDatas = consolidatedRecords.map((record) => {
        const antDataForRecord = uniqueAntData.find(
          (ant) => ant.processId === record.processId,
        ) as {
          owner: string;
          controllers: string[];
          name: string;
          ticker: string;
          undernameLimit: number;
        };
        return { ant: antDataForRecord, record };
      });

      return newDatas as any;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function buildDomainRows(
    data: {
      ant: {
        owner: string;
        controllers: string[];
        name: string;
        ticker: string;
        undernameLimit: number;
      };
      record: AoArNSNameData & { name: string };
    }[],
    address: ArweaveTransactionID,
  ) {
    const fetchedRows: ARNSTableRow[] = [];

    try {
      const rowData = data.map(
        (data: {
          ant: {
            owner: string;
            controllers: string[];
            name: string;
            ticker: string;
            undernameLimit: number;
          };
          record: AoArNSNameData & { name: string };
        }) => {
          return {
            name: decodeDomainToASCII(data.record.name),
            id: data.record.processId,
            role:
              // TODO: use a utility function in ar.io/sdk
              data.ant.owner === walletAddress?.toString()
                ? 'Owner'
                : data.ant.controllers.includes(address.toString())
                ? 'Controller'
                : 'N/A',
            expiration: isLeasedArNSRecord(data.record)
              ? formatDate(data.record.endTimestamp)
              : 'Indefinite',
            startTimestamp: data.record.startTimestamp,
            undernameSupport:
              data.record?.undernameLimit ?? DEFAULT_MAX_UNDERNAMES,
            undernameLimit: data.ant.undernameLimit,
            undernameCount: `${data.ant.undernameLimit.toLocaleString()} / ${(
              data.record?.undernameLimit ?? DEFAULT_MAX_UNDERNAMES
            ).toLocaleString()}`,
            key: `${data.record.name}-${data.record.processId}`,
            errors: [],
          };
        },
      );
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
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows: searchText.length && searchOpen ? filteredResults : rows,
    sortField,
    sortAscending,
    selectedRow,
    refresh: invalidate,
  };
}
