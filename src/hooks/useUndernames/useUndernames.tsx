import { Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useArweaveCompositeProvider } from '..';
import {
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from '../../components/icons/index';
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
import eventEmitter from '../../utils/events';

export function useUndernames(id?: ArweaveTransactionID) {
  const [{ gateway }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof UndernameMetadata>('name');
  const [selectedRow, setSelectedRow] = useState<UndernameMetadata>();
  const [rows, setRows] = useState<UndernameMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number>(0);
  const [action, setAction] = useState<
    UndernameTableInteractionTypes | undefined
  >();

  useEffect(() => {
    if (!id) {
      return;
    }
    generateTableColumns();
    fetchUndernameRows(id);
  }, [id]);

  function generateTableColumns(): ColumnType<UndernameMetadata>[] {
    const newColumns: ColumnType<UndernameMetadata>[] = [
      {
        title: (
          <button
            className="flex-row pointer grey"
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
        className: 'grey manage-assets-table-header',
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
            className="flex-row pointer grey"
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
        className: 'grey manage-assets-table-header',
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
            className="flex-row pointer grey"
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
        className: 'grey manage-assets-table-header',
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
        render: (value, row) => (
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
  };
}
