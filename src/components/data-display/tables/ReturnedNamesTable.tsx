import { ReturnedName } from '@ar.io/sdk';
import { mARIOToken } from '@ar.io/sdk';
import { ChevronRightIcon, ExternalLinkIcon } from '@src/components/icons';
import Switch from '@src/components/inputs/Switch';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SolanaAddress } from '@src/services/solana/SolanaAddress';
import { useGlobalState, useWalletState } from '@src/state';
import { TRANSACTION_TYPES } from '@src/types';
import {
  camelToReadable,
  decodeDomainToASCII,
  encodeDomainToASCII,
  formatARIOWithCommas,
  formatDate,
  formatForMaxCharCount,
  isArweaveTransactionID,
  isValidAoAddress,
  lowerCaseDomain,
} from '@src/utils';
import {
  ARNS_PURCHASES_DISABLED,
  ARNS_PURCHASES_DISABLED_TOOLTIP,
  NETWORK_DEFAULTS,
} from '@src/utils/constants';
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table';
import { Tooltip as AntdTooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Tooltip } from '..';
import { RNPChart } from '../charts/RNPChart';
import TableView from './TableView';

type TableData = {
  openRow: ReactNode;
  name: string;
  startDate: number;
  closingDate: number;
  initiator: string;
  returnType: string;
  action: ReactNode;
} & Record<string, any>;

const columnHelper = createColumnHelper<TableData>();

function filterTableData(filter: string, data: TableData[]): TableData[] {
  const results: TableData[] = [];

  data.forEach((d) => {
    let matchFound = false;

    Object.entries(d).forEach(([, v]) => {
      if (typeof v === 'object' && v !== null) {
        // Recurse into nested objects
        const nestedResults = filterTableData(filter, [v]);
        if (nestedResults.length > 0) {
          matchFound = true;
        }
      } else if (v?.toString()?.toLowerCase()?.includes(filter.toLowerCase())) {
        matchFound = true;
      }
    });
    if (!matchFound && d.antRecords) {
      Object.keys(d?.antRecords).forEach((undername) => {
        if (undername?.toLowerCase()?.includes(filter.toLowerCase())) {
          matchFound = true;
        }
      });
    }

    if (matchFound) {
      results.push(d);
    }
  });

  return results;
}

const ReturnedNamesTable = ({
  returnedNames,
  loading,
  filter,
}: {
  returnedNames?: Array<ReturnedName & { name: string }>;
  loading: boolean;
  filter?: string;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [{ arioTicker }] = useGlobalState();
  const arioProcessId = '';

  const [tableData, setTableData] = useState<Array<TableData>>([]);
  const [filteredTableData, setFilteredTableData] = useState<TableData[]>([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'name');

  const dateNow = useMemo(() => {
    return Date.now();
  }, []);

  useEffect(() => {
    setSortBy(searchParams.get('sortBy') ?? 'name');
  }, [searchParams]);

  useEffect(() => {
    if (loading) {
      setTableData([]);
      setFilteredTableData([]);
      return;
    }
    if (returnedNames) {
      const newTableData: TableData[] = [];

      returnedNames.map((nameData) => {
        const { name, initiator, startTimestamp, endTimestamp } = nameData;
        const data: TableData = {
          openRow: <></>,
          name,
          startDate: startTimestamp,
          closingDate: endTimestamp,
          initiator,
          returnType:
            initiator === arioProcessId ? 'Lease Expiry' : 'Permanent Return',

          action: <></>,
          // metadata used for search and other purposes
          returnNameData: nameData,
        };
        newTableData.push(data);
      });

      setTableData(newTableData);
    }
  }, [returnedNames, loading]);

  useEffect(() => {
    if (filter) {
      setFilteredTableData(filterTableData(filter, tableData));
    } else {
      setFilteredTableData([]);
    }
  }, [filter, tableData]);
  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    'openRow',
    'name',
    'startDate',
    'closingDate',
    'initiator',
    'returnType',
    'action',
  ].map((key) =>
    columnHelper.accessor(key as keyof TableData, {
      id: key,
      size: key === 'action' || key === 'openRow' ? 20 : undefined,
      header: key === 'action' || key === 'openRow' ? '' : camelToReadable(key),
      sortDescFirst: true,
      sortingFn: 'alphanumeric',
      cell: ({ row }) => {
        const rowValue = row.getValue(key) as any;
        if (rowValue === undefined || rowValue === null) {
          return '';
        }

        switch (key) {
          case 'openRow': {
            return (
              <button
                onClick={() => row.toggleExpanded()}
                style={{
                  transform: row.getIsExpanded() ? 'rotate(90deg)' : undefined,
                }}
              >
                <ChevronRightIcon
                  width={'18px'}
                  height={'18px'}
                  fill={'var(--text-white)'}
                />
              </button>
            );
          }
          case 'name': {
            return (
              <Tooltip
                tooltipOverrides={{
                  overlayClassName: 'w-fit',
                  overlayInnerStyle: { width: 'fit-content' },
                }}
                message={
                  <span className="w-fit whitespace-nowrap text-white">
                    {rowValue}
                  </span>
                }
                icon={
                  <Link
                    className="link gap-2 w-fit items-center"
                    to={`https://${encodeDomainToASCII(
                      row.getValue('name'),
                    )}.${NETWORK_DEFAULTS.ARNS.HOST}`}
                    target="_blank"
                  >
                    {formatForMaxCharCount(decodeDomainToASCII(rowValue), 20)}{' '}
                    <ExternalLinkIcon className="size-3 fill-grey" />
                  </Link>
                }
              />
            );
          }
          case 'startDate': {
            return formatDate(rowValue);
          }
          case 'closingDate': {
            return formatDate(rowValue);
          }
          case 'initiator': {
            if (typeof rowValue !== 'string' || !isValidAoAddress(rowValue)) {
              return rowValue;
            }
            return (
              <ArweaveID
                id={
                  isArweaveTransactionID(rowValue)
                    ? new ArweaveTransactionID(rowValue)
                    : new SolanaAddress(rowValue)
                }
                shouldLink
                characterCount={12}
                type={ArweaveIdTypes.ADDRESS}
              />
            );
          }
          case 'returnType': {
            return rowValue;
          }

          case 'action': {
            const registerButton = (
              <button
                className="p-2 py-[0.4rem] text-center size-fit rounded text-black bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={ARNS_PURCHASES_DISABLED}
                onClick={() => {
                  if (!ARNS_PURCHASES_DISABLED) {
                    navigate(`/register/${lowerCaseDomain(row.original.name)}`);
                  }
                }}
              >
                Register
              </button>
            );
            return (
              <div className="flex justify-end w-full ">
                <span className="flex pr-3 w-fit h-fit gap-3 items-center justify-center overflow-visible max-h-[15px]">
                  {ARNS_PURCHASES_DISABLED ? (
                    <AntdTooltip
                      title={ARNS_PURCHASES_DISABLED_TOOLTIP}
                      color="var(--box-color)"
                      overlayInnerStyle={{ padding: '15px' }}
                    >
                      <span style={{ display: 'inline-block' }}>
                        {registerButton}
                      </span>
                    </AntdTooltip>
                  ) : (
                    registerButton
                  )}
                </span>
              </div>
            );
          }

          default: {
            return rowValue;
          }
        }
      },
    }),
  );

  const RNPChartSubComponent = ({ row }: { row: Row<TableData> }) => {
    const [purchaseType, setPurchaseType] = useState<TRANSACTION_TYPES>(
      TRANSACTION_TYPES.LEASE,
    );

    return (
      <div className="flex flex-col w-full gap-6 h-[400px] p-6">
        <div className="flex justify-between items-center text-grey">
          <span>Returned Name</span>
          <div className="flex gap-4 items-center justify-center">
            <CurrentPrice
              name={row.original.name}
              type={purchaseType}
              arioTicker={arioTicker}
            />
            <Switch
              checked={purchaseType === TRANSACTION_TYPES.BUY}
              onChange={(checked: boolean) =>
                setPurchaseType(
                  checked ? TRANSACTION_TYPES.BUY : TRANSACTION_TYPES.LEASE,
                )
              }
              className={{
                root: 'outline-none size-full w-[3rem] rounded-full border border-dark-grey',
                thumb:
                  'block size-[21px] translate-x-0.5 rounded-full bg-primary transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[1.43rem]',
              }}
            />
          </div>
        </div>
        <RNPChart
          name={row.original.name}
          purchaseDetails={{
            type: purchaseType,
          }}
          dateNow={dateNow}
          startTimestamp={row.original.startDate}
          endTimestamp={row.original.closingDate}
        />
      </div>
    );
  };

  return (
    <>
      <div className="w-full">
        <TableView
          columns={columns}
          data={
            filteredTableData.length
              ? filteredTableData
              : tableData.length
                ? tableData
                : []
          }
          isLoading={false}
          noDataFoundText={
            loading ? (
              <div className="flex flex-column center white p-[100px]">
                <Loader message="Loading assets..." />
              </div>
            ) : (
              <div className="flex flex-column center p-[100px]">
                <>
                  <span className="white bold" style={{ fontSize: '16px' }}>
                    No Returned Names Found
                  </span>
                </>

                <div className="flex flex-row center" style={{ gap: '16px' }}>
                  <Link
                    to="/"
                    className="bg-primary rounded-md text-black center hover px-4 py-3 text-sm"
                  >
                    Search for a Name
                  </Link>
                </div>
              </div>
            )
          }
          defaultSortingState={{
            id: sortBy,
            desc: sortBy === 'closingData' ? false : true,
          }}
          renderSubComponent={({ row }) => <RNPChartSubComponent row={row} />}
          tableClass="overflow-hidden rounded"
          tableWrapperClassName="border border-dark-grey rounded"
          rowClass={(props) => {
            if (props?.headerGroup) {
              return 'rounded-t';
            }
            if (props?.row !== undefined) {
              return props.row.getIsExpanded()
                ? 'bg-[#1B1B1D] '
                : 'overflow-hidden' +
                    '  data-[id=renderSubComponent]:hover:bg-background';
            }

            return '';
          }}
          dataClass={(props) => {
            if (props?.headerGroup) {
              return 'rounded-t whitespace-nowrap';
            }
            if (props?.row !== undefined && props.row.getIsExpanded()) {
              return 'border-t-[1px] border-dark-grey border-b-0';
            }

            return '';
          }}
          headerClass="bg-foreground rounded-t"
        />
      </div>
    </>
  );
};

/**
 * Displays the current price for a returned name, fetched on demand
 * when the row is expanded. Keeps RPC calls out of the main table render.
 */
function CurrentPrice({
  name,
  type,
  arioTicker,
}: {
  name: string;
  type: TRANSACTION_TYPES;
  arioTicker: string;
}) {
  const [{ walletAddress }] = useWalletState();
  const { data: costDetails, isLoading } = useCostDetails({
    intent: 'Buy-Name',
    name,
    type: type === TRANSACTION_TYPES.BUY ? 'permabuy' : 'lease',
    years: 1,
    fromAddress: walletAddress?.toString(),
  });

  if (isLoading) {
    return <span className="text-white animate-pulse">Loading price...</span>;
  }

  if (!costDetails) {
    return <span className="text-grey">Price unavailable</span>;
  }

  const price = new mARIOToken(costDetails.tokenCost).toARIO().valueOf();

  return (
    <span className="text-white font-semibold">
      {type === TRANSACTION_TYPES.LEASE ? 'Lease 1yr' : 'Permabuy'}:{' '}
      {formatARIOWithCommas(price)} {arioTicker}
    </span>
  );
}

export default ReturnedNamesTable;
