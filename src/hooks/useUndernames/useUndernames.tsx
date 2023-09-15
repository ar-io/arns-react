import { ColumnType } from 'rc-table/lib/interface';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '..';
import {
  CalendarTimeIcon,
  ChevronUpIcon,
  NotebookIcon,
  PencilIcon,
  TargetIcon,
  TrashIcon,
} from '../../components/icons/index';
import CopyTextButton from '../../components/inputs/buttons/CopyTextButton/CopyTextButton';
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

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchUndernameRows(id);
  }, [id]);

  function generateTableColumns(): ColumnType<UndernameMetadata>[] {
    return [
      {
        title: (
          <button
            className="flex-row pointer white"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('name')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'name' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Undername</span>
            <NotebookIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: '18%',
        className: 'icon-padding white assets-table-header',
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
        title: (
          <button
            className="flex-row pointer white center"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('targetID')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
              style={
                sortField === 'targetID' && !sortAscending
                  ? { transform: 'rotate(180deg)' }
                  : {}
              }
            />
            <span>Target ID</span>
            <TargetIcon width={24} height={24} fill={'var(--text-grey)'} />
          </button>
        ),
        dataIndex: 'targetID',
        key: 'targetID',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
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
                  fill: 'var(--text-grey)',
                }}
                size={15}
                copyText={val}
                body={isMobile ? `${val.slice(0, 2)}...${val.slice(-2)}` : val}
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
        title: (
          <button
            className="flex-row pointer white center"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('ttlSeconds')}
          >
            <ChevronUpIcon
              width={10}
              height={10}
              fill={'var(--text-grey)'}
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
              fill={'var(--text-grey)'}
            />
          </button>
        ),
        dataIndex: 'ttlSeconds',
        key: 'ttlSeconds',
        align: 'center',
        width: '18%',
        className: 'white assets-table-header',
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
        className: 'assets-table-header',
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
