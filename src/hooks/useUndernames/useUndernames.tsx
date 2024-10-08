import { ANT } from '@ar.io/sdk/web';
import { useArNSState } from '@src/state/contexts/ArNSState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  UNDERNAME_TABLE_ACTIONS,
  UndernameMetadata,
  UndernameTableInteractionTypes,
} from '../../types';
import { isArweaveTransactionID } from '../../utils';
import { ARNS_NAME_REGEX_PARTIAL } from '../../utils/constants';

export function useUndernames(id?: ArweaveTransactionID, name?: string) {
  const [{ gateway }] = useGlobalState();
  const [{ domains }] = useArNSState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] = useState<keyof UndernameMetadata>('name');
  const [selectedRow, setSelectedRow] = useState<UndernameMetadata>();
  const [rows, setRows] = useState<UndernameMetadata[]>([]);
  const [columns, setColumns] = useState<ColumnType<UndernameMetadata>[]>([]);
  const [filteredResults, setFilteredResults] = useState<UndernameMetadata[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [action, setAction] = useState<
    UndernameTableInteractionTypes | undefined
  >();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!id && !name) {
      return;
    }
    fetchUndernameRows(id, name);
  }, [id, name, walletAddress]);
  useEffect(() => {
    setColumns(generateTableColumns());
  }, [isAuthorized]);

  useEffect(() => {
    if (searchText) {
      const filtered = rows.filter((row) =>
        row.name.toLowerCase().startsWith(searchText.toLowerCase()),
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  }, [searchText, walletAddress, name]);

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
        render: (val: string, row: UndernameMetadata) => (
          <Link
            to={`https://${val}_${row.domain}.${gateway}`}
            rel="noreferrer"
            target="_blank"
            className="link"
            aria-disabled={row.domain == undefined}
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
                  ? a.ttlSeconds - b.ttlSeconds
                  : b.ttlSeconds - a.ttlSeconds,
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
                    paddingRight: '10px',
                  }}
                  customPattern={ARNS_NAME_REGEX_PARTIAL}
                  validationPredicates={{}}
                />
                <button
                  className="flex button center pointer"
                  onClick={() => {
                    setSearchText('');
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
        className: 'manage-assets-table-header',
        render: (value, row) => (
          <div
            className="flex flex-row action-buttons fade-in"
            style={{ gap: '10px', justifyContent: 'flex-end' }}
          >
            {isAuthorized && (
              <>
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
                    <PencilIcon
                      width={18}
                      height={18}
                      fill={'var(--text-grey)'}
                    />
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
                    <TrashIcon
                      width={18}
                      height={18}
                      fill={'var(--text-grey)'}
                    />
                  </button>
                </Tooltip>
              </>
            )}
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

  async function fetchUndernameRows(
    id?: ArweaveTransactionID,
    name?: string,
  ): Promise<void> {
    let processId: ArweaveTransactionID | undefined = undefined;
    if (id) {
      processId = id;
    } else if (name) {
      const arnsRecord = domains[name];
      if (arnsRecord)
        processId = new ArweaveTransactionID(arnsRecord.processId);
    }

    if (!processId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const domain = Object.keys(domains).find(
      (d) => domains[d].processId === processId?.toString(),
    );
    const state = await ANT.init({
      processId: processId.toString(),
    }).getState();

    const rows = Object.entries(state.Records)
      .map(([name, record]) =>
        name === '@'
          ? undefined
          : {
              domain,
              name,
              targetID: record.transactionId,
              ttlSeconds: record.ttlSeconds,
              status: 0,
              key: name,
            },
      )
      .filter((row) => row !== undefined)
      .sort((a, b) => a!.status - b!.status);
    setRows(rows as UndernameMetadata[]);
    const authorized = walletAddress
      ? state.Controllers.includes(walletAddress.toString()) ||
        state.Owner === walletAddress.toString()
      : false;
    setIsAuthorized(authorized);
    setIsLoading(false);
  }

  return {
    isLoading,
    columns,
    rows: filteredResults.length ? filteredResults : rows,
    sortField,
    sortAscending,
    selectedRow,
    action,
    setAction: (action: UNDERNAME_TABLE_ACTIONS | undefined) =>
      setAction(action),
    refresh: () => fetchUndernameRows(id, name),
  };
}
