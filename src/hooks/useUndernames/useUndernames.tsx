import { Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import { FilterConfirmProps } from 'antd/es/table/interface';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useArweaveCompositeProvider } from '..';
import {
  ChevronUpIcon,
  CircleXFilled,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/icons/index';
import ValidationInput from '../../components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '../../components/layout/ArweaveID/ArweaveID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  UNDERNAME_TABLE_ACTIONS,
  UndernameMetadata,
  UndernameTableInteractionTypes,
} from '../../types';
import { isArweaveTransactionID } from '../../utils';
import { PDNS_NAME_REGEX } from '../../utils/constants';
import eventEmitter from '../../utils/events';

export function useUndernames(id?: ArweaveTransactionID) {
  const [{ gateway }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof UndernameMetadata>('name');
  const [selectedRow, setSelectedRow] = useState<UndernameMetadata>();
  const [rows, setRows] = useState<UndernameMetadata[]>([]);
  const [columns, setColumns] = useState<ColumnType<UndernameMetadata>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number>(0);
  const [action, setAction] = useState<
    UndernameTableInteractionTypes | undefined
  >();
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [undernameFilter, setUndernameFilter] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchUndernameRows(id);
  }, [id]);

  useEffect(() => {
    generateTableColumns();
  }, [searchOpen]);

  type DataIndex = keyof UndernameMetadata;

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    console.log('im searching');

    setUndernameFilter((selectedKeys as string[])[0]);
    setSearchedColumn(dataIndex.toString());
    confirm({ closeDropdown: false });
  };

  const handleReset = (clearFilters: () => void) => {
    console.log('im resetting');
    clearFilters();
    setUndernameFilter('');
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): ColumnType<UndernameMetadata> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
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
          onClick={() => {
            confirm({ closeDropdown: false });
            console.log(selectedKeys);
            setUndernameFilter((selectedKeys as string[])[0]);
            setSearchedColumn(dataIndex.toString());
          }}
        >
          <SearchIcon
            width={'16px'}
            height={'16px'}
            fill={searchOpen ? 'var(--text-white)' : 'var(--text-grey)'}
          />
        </button>

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
            ref={searchInput}
            onPressEnter={() => {
              confirm({ closeDropdown: false });
              setUndernameFilter((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex.toString());
            }}
            value={selectedKeys[0]}
            setValue={(e) => setSelectedKeys(e ? [e] : [])}
            customPattern={PDNS_NAME_REGEX}
            catchInvalidInput={false}
            showValidationIcon={true}
            placeholder={'Search for a name'}
            maxCharLength={61}
            wrapperCustomStyle={{
              position: 'relative',
              boxSizing: 'border-box',
            }}
            inputCustomStyle={{
              width: '100%',
              minWidth: '100px',
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
            }}
          />
          <button
            className="flex button center pointer"
            onClick={() => {
              if (clearFilters) {
                handleReset(clearFilters);
              }
            }}
          >
            <CircleXFilled
              width={'18px'}
              height={'18px'}
              fill={'var(--text-grey)'}
            />
          </button>
        </span>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchIcon
        width={'18px'}
        height={'18px'}
        fill={filtered ? 'var(--accent)' : 'var(--text-grey)'}
      />
    ),
    onFilter: (value, record) => {
      console.log('im filtering', value, record);
      const res = record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
      if (!res) {
        return false;
      }
      return res;
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  function generateTableColumns(): ColumnType<UndernameMetadata>[] {
    const newColumns: ColumnType<UndernameMetadata>[] = [
      {
        ...getColumnSearchProps('name'),
        title: (
          <button
            className="flex-row pointer white"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('name')}
          >
            <span>Undername</span>
            {sortField === 'name' ? (
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-grey)'}
                style={!sortAscending ? { transform: 'rotate(180deg)' } : {}}
              />
            ) : (
              <></>
            )}
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: UndernameMetadata, b: UndernameMetadata) =>
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
        render: (val: string) => (
          <Link
            to={`https://${val}.${gateway}`}
            rel="noreferrer"
            target="_blank"
            className="link"
          >
            {val}
          </Link>
        ),
      },
      {
        title: (
          <button
            className="flex-row pointer white"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('targetID')}
          >
            <span>Target ID</span>
            {sortField === 'targetID' ? (
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-grey)'}
                style={!sortAscending ? { transform: 'rotate(180deg)' } : {}}
              />
            ) : (
              <></>
            )}
          </button>
        ),
        dataIndex: 'targetID',
        key: 'targetID',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        render: (val: string) =>
          val === 'N/A' || !isArweaveTransactionID(val) ? (
            val
          ) : (
            <ArweaveID
              id={new ArweaveTransactionID(val)}
              characterCount={12}
              shouldLink
              type={ArweaveIdTypes.TRANSACTION}
            />
          ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: any, b: any) =>
                sortAscending
                  ? a.targetID.localeCompare(b.targetID)
                  : b.targetID.localeCompare(a.targetID),
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
            className="flex-row pointer white"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('ttlSeconds')}
          >
            <span>TTL</span>
            {sortField === 'ttlSeconds' ? (
              <ChevronUpIcon
                width={10}
                height={10}
                fill={'var(--text-grey)'}
                style={!sortAscending ? { transform: 'rotate(180deg)' } : {}}
              />
            ) : (
              <></>
            )}
          </button>
        ),
        dataIndex: 'ttlSeconds',
        key: 'ttlSeconds',
        align: 'left',
        width: '18%',
        className: 'white manage-assets-table-header',
        render: (val: string) => val,
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: any, b: any) =>
                sortAscending
                  ? a.ttlSeconds.localeCompare(b.ttlSeconds)
                  : b.ttlSeconds.localeCompare(a.ttlSeconds),
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
        className: 'manage-assets-table-header',
        render: (row) => (
          <div
            className="flex flex-row action-buttons fade-in"
            style={{ gap: '10px', justifyContent: 'flex-end' }}
          >
            <Tooltip
              trigger={['hover']}
              title={'Edit'}
              color="var(--card-bg)"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                className="button pointer"
                onClick={() => {
                  setSelectedRow(row);
                  setAction(UNDERNAME_TABLE_ACTIONS.EDIT);
                }}
              >
                <PencilIcon width={18} height={18} fill={'var(--text-grey)'} />
              </button>
            </Tooltip>

            <Tooltip
              trigger={['hover']}
              title={'Delete'}
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                className="button pointer"
                onClick={() => {
                  setSelectedRow(row);
                  setAction(UNDERNAME_TABLE_ACTIONS.REMOVE);
                }}
              >
                <TrashIcon width={18} height={18} fill={'var(--text-grey)'} />
              </button>
            </Tooltip>
          </div>
        ),
        align: 'right',
        width: '10%',
        key: 'action',
        dataIndex: 'action',
      },
    ];
    return newColumns;
  }

  async function fetchUndernameRows(id: ArweaveTransactionID): Promise<void> {
    setIsLoading(true);
    const fetchedRows: UndernameMetadata[] = [];
    const [contractState, confirmations] = await Promise.all([
      arweaveDataProvider.getContractState<PDNTContractJSON>(id),
      arweaveDataProvider
        .getTransactionStatus(id)
        .then((status) => status[id.toString()]),
    ]);

    const undernames = Object.entries(contractState.records).filter(
      ([key]) => key !== '@',
    );
    for (const [name, record] of undernames) {
      try {
        const rowData = {
          name: name,
          targetID: (typeof record === 'string'
            ? record
            : record.transactionId) as string,
          ttlSeconds: (typeof record === 'string'
            ? 'N/A'
            : record.ttlSeconds) as string,
          status: confirmations ?? 0,
          key: name,
        };
        // sort by confirmation count (ASC) by default
        fetchedRows.sort((a, b) => a.status - b.status);
        fetchedRows.push(rowData);
      } catch (error) {
        eventEmitter.emit('error', error);
      } finally {
        setPercentLoaded(
          ((undernames.indexOf([name, record]) + 1) / undernames.length) * 100,
        );
      }
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
    action,
    setAction: (action: UNDERNAME_TABLE_ACTIONS | undefined) =>
      setAction(action),
    undernameFilter,
  };
}
