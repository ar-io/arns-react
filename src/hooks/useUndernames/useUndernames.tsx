import { InputRef } from 'antd';
import { ColumnType } from 'antd/es/table';
import { FilterConfirmProps } from 'antd/es/table/interface';
import { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';

import { useArweaveCompositeProvider, useIsMobile } from '..';
import {
  CalendarTimeIcon,
  ChevronUpIcon,
  NotebookIcon,
  PencilIcon,
  SearchIcon,
  TargetIcon,
  TrashIcon,
} from '../../components/icons/index';
import CopyTextButton from '../../components/inputs/buttons/CopyTextButton/CopyTextButton';
import ValidationInput from '../../components/inputs/text/ValidationInput/ValidationInput';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  UNDERNAME_TABLE_ACTIONS,
  UndernameMetadata,
  UndernameTableInteractionTypes,
} from '../../types';
import eventEmitter from '../../utils/events';

export function useUndernames(id?: ArweaveTransactionID) {
  const isMobile = useIsMobile();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof UndernameMetadata>('status');
  const [selectedRow, setSelectedRow] = useState<UndernameMetadata>();
  const [rows, setRows] = useState<UndernameMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number>(0);
  const [action, setAction] = useState<
    UndernameTableInteractionTypes | undefined
  >();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchUndernameRows(id);
  }, [id]);

  type DataIndex = keyof UndernameMetadata;
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex.toString());
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): ColumnType<UndernameMetadata> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        className="card flex flex-column"
        style={{ padding: '15px', gap: 15, minHeight: 0 }}
      >
        <div className="flex flex-row flex-center" style={{ gap: 0 }}>
          <ValidationInput
            ref={searchInput}
            placeholder={`Search ${dataIndex.toString()}`}
            value={selectedKeys[0]}
            setValue={(e) => setSelectedKeys(e ? [e] : [])}
            onPressEnter={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            inputCustomStyle={{ height: 30, width: '100%' }}
            inputClassName="data-input"
            wrapperCustomStyle={{ width: '100%' }}
            validationPredicates={{}}
          />
          <button
            className="button center hover"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            style={{ width: 'fit-content' }}
          >
            <SearchIcon width={20} height={20} fill={'var(--text-faded)'} />
          </button>
        </div>

        <div className="flex flex-column" style={{ gap: 10 }}>
          <button
            className="accent-button center"
            onClick={() => clearFilters && handleReset(clearFilters)}
            style={{ height: '30px', width: '100%' }}
          >
            Reset
          </button>
          <button
            className="outline-button center"
            style={{ height: '30px', width: '100%' }}
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex.toString());
            }}
          >
            Filter
          </button>
          <button
            className="outline-button center"
            style={{ height: '30px', width: '100%' }}
            onClick={() => {
              close();
            }}
          >
            close
          </button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchIcon
        width={20}
        height={20}
        fill={filtered ? 'var(--accent)' : 'var(--text-faded)'}
      />
    ),
    onFilter: (value, record) => {
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
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  function generateTableColumns(): ColumnType<UndernameMetadata>[] {
    return [
      {
        ...getColumnSearchProps('name'),
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
            <span>Undername</span>
            <NotebookIcon width={24} height={24} fill={'var(--text-faded)'} />
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'icon-padding white',
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
      },
      {
        ...getColumnSearchProps('targetID'),
        title: (
          <button
            className="flex-row pointer white center"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('targetID')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-faded)'}
              style={
                sortField === 'targetID' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Target ID</span>
            <TargetIcon width={24} height={24} fill={'var(--text-faded)'} />
          </button>
        ),
        dataIndex: 'targetID',
        key: 'targetID',
        align: 'center',
        width: '18%',
        className: 'white',
        render: (val: string) =>
          val ? (
            <div
              className="flex flex-column flex-center"
              style={{ position: 'relative' }}
            >
              <CopyTextButton
                wrapperStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                size={'70%'}
                copyText={val}
                displayText={
                  isMobile ? `${val.slice(0, 2)}...${val.slice(-2)}` : val
                }
              />
            </div>
          ) : (
            val
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
        onFilter: (value, record) =>
          record.ttlSeconds.startsWith(value.toString()),
        title: (
          <button
            className="flex-row pointer white center"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('ttlSeconds')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-faded)'}
              style={
                sortField === 'ttlSeconds' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>TTL</span>
            <CalendarTimeIcon
              width={24}
              height={24}
              fill={'var(--text-faded)'}
            />
          </button>
        ),
        dataIndex: 'ttlSeconds',
        key: 'ttlSeconds',
        align: 'center',
        width: '18%',
        className: 'white',
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
        render: (row) => (
          <div className="flex flex-row flex-center" style={{ gap: '1em' }}>
            <button
              className="button hover"
              onClick={() => {
                setSelectedRow(row);
                setAction(UNDERNAME_TABLE_ACTIONS.EDIT);
              }}
            >
              <PencilIcon width={25} height={25} fill={'var(--text-white)'} />
            </button>
            <button
              className="button hover"
              onClick={() => {
                setSelectedRow(row);
                setAction(UNDERNAME_TABLE_ACTIONS.REMOVE);
              }}
            >
              <TrashIcon width={25} height={25} fill={'var(--text-white)'} />
            </button>
          </div>
        ),
        align: 'right',
        width: '10%',
      },
    ];
  }

  async function fetchUndernameRows(id: ArweaveTransactionID) {
    setIsLoading(true);
    const fetchedRows: UndernameMetadata[] = [];
    const [contractState, confirmations] = await Promise.all([
      arweaveDataProvider.getContractState<PDNTContractJSON>(id),
      arweaveDataProvider.getTransactionStatus(id),
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
    searchText,
  };
}
