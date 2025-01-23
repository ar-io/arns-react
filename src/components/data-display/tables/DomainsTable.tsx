import {
  AoANTHandler,
  AoANTState,
  AoArNSNameData,
  isLeasedArNSRecord,
} from '@ar.io/sdk';
import { ChevronRightIcon, ExternalLinkIcon } from '@src/components/icons';
import ManageAssetButtons from '@src/components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import UpgradeAntModal from '@src/components/modals/ant-management/UpgradeAntModal/UpgradeAntModal';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import {
  useGlobalState,
  useModalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import {
  camelToReadable,
  decodeDomainToASCII,
  doAntsRequireUpdate,
  encodeDomainToASCII,
  formatExpiryDate,
  formatForMaxCharCount,
  formatVerboseDate,
  getOwnershipStatus,
  isArweaveTransactionID,
  lowerCaseDomain,
} from '@src/utils';
import {
  NETWORK_DEFAULTS,
  PERMANENT_DOMAIN_MESSAGE,
} from '@src/utils/constants';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { capitalize } from 'lodash';
import { CircleCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Tooltip } from '..';
import RegistrationTip from '../RegistrationTip';
import TableView from './TableView';
import UndernamesSubtable from './UndernamesSubtable';

type TableData = {
  openRow: ReactNode;
  name: string;
  role: string;
  processId: string;
  targetId: string;
  ioCompatible?: boolean;
  undernames: {
    used: number;
    supported: number;
  };
  expiryDate: string;
  handlers: AoANTHandler[] | null;
  status: string | number;
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

const DomainsTable = ({
  domainData,
  loading,
  filter,
}: {
  domainData: {
    names: Record<string, AoArNSNameData>;
    ants: Record<
      string,
      { state: AoANTState | null; handlers: AoANTHandler[] | null }
    >;
  };
  loading: boolean;
  filter?: string;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [{ walletAddress }] = useWalletState();
  const [{ arioProcessId }] = useGlobalState();
  const [, dispatchModalState] = useModalState();
  const [, dispatchTransactionState] = useTransactionState();
  const { data: primaryNameData } = usePrimaryName();
  const [tableData, setTableData] = useState<Array<TableData>>([]);
  const [filteredTableData, setFilteredTableData] = useState<TableData[]>([]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'name');

  const [showUpgradeAntModal, setShowUpgradeAntModal] =
    useState<boolean>(false);
  const [antIdToUpgrade, setAntIdToUpgrade] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setSortBy(searchParams.get('sortBy') ?? 'name');
  }, [searchParams]);

  useEffect(() => {
    if (domainData) {
      const newTableData: TableData[] = [];

      Object.entries(domainData.names).map(([domain, record]) => {
        const ant = domainData.ants[record.processId];
        const isIoCompatible =
          walletAddress && ant?.state && record?.processId
            ? !doAntsRequireUpdate({
                ants: {
                  [record.processId]: {
                    state: ant.state,
                    handlers: ant.handlers,
                  },
                },
                userAddress: walletAddress.toString(),
              })
            : false;

        const data: TableData = {
          openRow: <></>,
          name: domain,
          role:
            getOwnershipStatus(
              ant?.state?.Owner,
              ant?.state?.Controllers,
              walletAddress?.toString(),
            ) ?? 'N/A',
          processId: record.processId,
          targetId: ant?.state?.Records?.['@']?.transactionId ?? 'N/A',
          ioCompatible: isIoCompatible,
          undernames: {
            used:
              Object.keys(ant?.state?.Records ?? {}).filter(
                (undername) => undername !== '@',
              )?.length ?? 0,
            supported: record.undernameLimit,
          },
          expiryDate: (record as any).endTimestamp ?? PERMANENT_DOMAIN_MESSAGE,
          status: isLeasedArNSRecord(record)
            ? record.endTimestamp
            : PERMANENT_DOMAIN_MESSAGE,
          action: <></>,
          // metadata used for search and other purposes
          antRecords: ant?.state?.Records,
          domainRecord: record,
          handlers: ant.handlers,
        };
        newTableData.push(data);
      });

      setTableData(newTableData);
    }
  }, [domainData, loading, primaryNameData]);

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
    'role',
    'processId',
    'targetId',
    'ioCompatible',
    'undernames',
    'expiryDate',
    'status',
    'action',
  ].map((key) =>
    columnHelper.accessor(key as keyof TableData, {
      id: key,
      size: key == 'action' || key == 'openRow' ? 20 : undefined,
      header:
        key == 'action' || key == 'openRow'
          ? ''
          : key == 'processId'
          ? 'Process ID'
          : key == 'targetId'
          ? 'Target ID'
          : key == 'ioCompatible'
          ? 'AR.IO Compatible'
          : camelToReadable(key),
      sortDescFirst: true,
      sortingFn:
        key == 'undernames'
          ? (rowA, rowB) => {
              return (
                rowA.original.undernames.used - rowB.original.undernames.used
              );
            }
          : 'alphanumeric',
      cell: ({ row }) => {
        const rowValue = row.getValue(key) as any;
        if (rowValue === undefined || rowValue === null) {
          return '';
        }
        const antHandlers = row.original.handlers;
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
                    className="link gap-2 w-fit"
                    to={`https://${encodeDomainToASCII(row.getValue('name'))}.${
                      NETWORK_DEFAULTS.ARNS.HOST
                    }`}
                    target="_blank"
                  >
                    {formatForMaxCharCount(decodeDomainToASCII(rowValue), 20)}{' '}
                    <ExternalLinkIcon
                      width={'12px'}
                      height={'12px'}
                      fill={'var(--text-white)'}
                    />
                  </Link>
                }
              />
            );
          }
          case 'role':
            if (loading && row.getValue(key) === 'N/A')
              return (
                <span className="animate-pulse text-white">Loading...</span>
              );
            return capitalize(row.getValue(key));
          case 'processId': {
            return (
              <ArweaveID
                id={row.getValue(key)}
                shouldLink={true}
                characterCount={8}
                type={ArweaveIdTypes.CONTRACT}
              />
            );
          }
          case 'targetId': {
            if (loading && row.getValue(key) === 'N/A')
              return (
                <span className="animate-pulse text-white">Loading...</span>
              );
            return isArweaveTransactionID(rowValue) ? (
              <ArweaveID
                id={rowValue}
                shouldLink={true}
                characterCount={8}
                type={ArweaveIdTypes.TRANSACTION}
              />
            ) : (
              rowValue
            );
          }
          case 'ioCompatible': {
            return rowValue ? (
              <CircleCheck className="text-success w-[16px]" />
            ) : (
              <button
                onClick={() => {
                  setAntIdToUpgrade(row.getValue('processId'));
                  setShowUpgradeAntModal(true);
                }}
                className="p-[4px] px-[8px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap"
              >
                Update
              </button>
            );
          }
          case 'undernames': {
            const { used, supported } = rowValue as Record<string, number>;

            return (
              <Tooltip
                tooltipOverrides={{
                  overlayClassName: 'w-fit',
                  overlayInnerStyle: { width: 'fit-content' },
                }}
                message={
                  used >= supported ? (
                    <span className="flex flex-column" style={{ gap: '8px' }}>
                      <span className="w-fit items-center text-center">
                        You&apos;ve exceeded your undername support by{' '}
                        {used - supported} undername
                        {used - supported > 1 ? 's' : ''}.{' '}
                      </span>
                      <Link
                        className="w-full whitespace-nowrap bg-primary rounded-md text-black hover:text-black center hover px-2"
                        to={`/manage/names/${row.getValue(
                          'name',
                        )}/upgrade-undernames`}
                      >
                        Increase your undername support.
                      </Link>
                    </span>
                  ) : (
                    <span className="justify-center items-center whitespace-nowrap flex flex-col">
                      <span className="w-fit">
                        You have used{' '}
                        <span className="font-bold">
                          {used}/{supported}
                        </span>{' '}
                        of your supported undernames.
                      </span>
                      <Link
                        to="https://docs.ar.io/arns/#under-names"
                        target="_blank"
                        rel="noreferrer"
                        className="link w-fit m-auto"
                      >
                        Learn more about Under_names
                      </Link>
                    </span>
                  )
                }
                icon={
                  <Link
                    className={`${used >= supported ? 'text-warning' : 'link'}`}
                    to={`/manage/names/${row.getValue(
                      'name',
                    )}/upgrade-undernames`}
                  >
                    {used} / {supported}
                  </Link>
                }
              />
            );
          }
          case 'expiryDate': {
            if (rowValue == PERMANENT_DOMAIN_MESSAGE) {
              return (
                <Tooltip
                  message={
                    'This domain is permanently registered and will never expire'
                  }
                  icon={<>Indefinite</>}
                />
              );
            }
            return (
              <Tooltip
                message={
                  'Enters grace period on approximately ' +
                  formatVerboseDate(rowValue)
                }
                icon={<>{formatExpiryDate(rowValue)}</>}
              />
            );
          }
          case 'status': {
            return (
              <span>
                <RegistrationTip
                  domain={domainData.names[row.getValue('name') as string]}
                />
              </span>
            );
          }
          case 'action': {
            return (
              <div className="flex justify-end w-full">
                <span className="flex  pr-3 w-fit gap-3">
                  <Tooltip
                    message={
                      !antHandlers?.includes('approvePrimaryName') ||
                      !antHandlers?.includes('removePrimaryNames')
                        ? 'Update ANT to access Primary Names workflow'
                        : primaryNameData?.name === row.getValue('name')
                        ? 'Remove Primary Name'
                        : 'Set Primary Name'
                    }
                    icon={
                      <button
                        disabled={
                          !antHandlers?.includes('approvePrimaryName') ||
                          !antHandlers?.includes('removePrimaryNames')
                        }
                        onClick={() => {
                          const targetName = row.getValue('name') as string;
                          if (primaryNameData?.name === targetName) {
                            // remove primary name payload
                            dispatchTransactionState({
                              type: 'setTransactionData',
                              payload: {
                                names: [targetName],
                                arioProcessId,
                                assetId: row.getValue('processId'),
                                functionName: 'removePrimaryNames',
                              },
                            });
                          } else {
                            dispatchTransactionState({
                              type: 'setTransactionData',
                              payload: {
                                name: targetName,
                                arioProcessId,
                                assetId: arioProcessId,
                                functionName: 'primaryNameRequest',
                              },
                            });
                          }

                          dispatchModalState({
                            type: 'setModalOpen',
                            payload: { showPrimaryNameModal: true },
                          });
                        }}
                      >
                        <Star
                          className={
                            (row.getValue('name') == primaryNameData?.name
                              ? 'text-primary fill-primary'
                              : 'text-grey') +
                            ` 
                    w-[18px]
                    `
                          }
                        />
                      </button>
                    }
                  />
                  <ManageAssetButtons
                    id={lowerCaseDomain(row.getValue('name') as string)}
                    assetType="names"
                    disabled={false}
                  />
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
            !walletAddress ? (
              <div className="flex flex-column text-medium center white p-[100px] box-border gap-[20px]">
                <button
                  onClick={() =>
                    navigate('/connect', {
                      // redirect logic for connect page to use
                      state: { from: '/manage', to: '/manage' },
                    })
                  }
                  className="button-secondary center p-[10px] w-fit"
                >
                  Connect
                </button>
                &nbsp; Connect your wallet to view your assets.
              </div>
            ) : loading ? (
              <div className="flex flex-column center white p-[100px]">
                <Loader message="Loading assets..." />
              </div>
            ) : (
              <div className="flex flex-column center p-[100px]">
                <>
                  <span className="white bold" style={{ fontSize: '16px' }}>
                    No Registered Names Found
                  </span>
                  <span className={'grey text-sm max-w-[400px]'}>
                    Arweave Names are friendly names for data on the Arweave
                    blockchain. They serve to improve finding, sharing, and
                    access to data, resistant to takedowns or losses.
                  </span>
                </>

                <div className="flex flex-row center" style={{ gap: '16px' }}>
                  <Link
                    to="/"
                    className="bg-primary rounded-md text-black center hover px-4 py-3"
                  >
                    Search for a Name
                  </Link>
                </div>
              </div>
            )
          }
          defaultSortingState={{
            id: sortBy,
            desc: sortBy == 'expiryDate' ? false : true,
          }}
          renderSubComponent={({ row }) => (
            <UndernamesSubtable
              undernames={
                domainData.ants?.[row.getValue('processId') as string]?.state
                  ?.Records ?? {}
              }
              arnsDomain={row.getValue('name')}
              antId={row.getValue('processId')}
              handlers={row.original.handlers}
            />
          )}
          tableClass="border-[1px] border-dark-grey"
          rowClass={(props) => {
            if (props?.row !== undefined) {
              return props.row.getIsExpanded()
                ? 'bg-foreground border-l-2 border-link border-t-0'
                : '' +
                    ' hover:bg-primary-thin data-[id=renderSubComponent]:hover:bg-background';
            }

            return '';
          }}
          dataClass={(props) => {
            if (props?.row !== undefined && props.row.getIsExpanded()) {
              return 'border-t-[1px] border-dark-grey border-b-0';
            }

            return '';
          }}
        />
      </div>
      {antIdToUpgrade && (
        <UpgradeAntModal
          antId={antIdToUpgrade}
          visible={showUpgradeAntModal}
          setVisible={(b: boolean) => {
            setShowUpgradeAntModal(b);
            setAntIdToUpgrade(undefined);
          }}
        />
      )}
    </>
  );
};

export default DomainsTable;
