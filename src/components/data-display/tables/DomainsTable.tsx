import { AoArNSNameData } from '@ar.io/sdk';
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  RefreshIcon,
} from '@src/components/icons';
import InterruptedWorkflowIndicator from '@src/components/indicators/InterruptedWorkflowIndicator/InterruptedWorkflowIndicator';
import ManageAssetButtons from '@src/components/inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import {
  ListNameForSaleModal,
  UpgradeDomainForMarketplaceModal,
} from '@src/components/modals';
import ContinueWorkflowModal from '@src/components/modals/ContinueWorkflowModal/ContinueWorkflowModal';
import UpgradeDomainModal from '@src/components/modals/ant-management/UpgradeDomainModal/UpgradeDomainModal';
import { useANTIntent } from '@src/hooks/useANTIntent';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import {
  InterruptedWorkflow,
  InterruptedWorkflowType,
  useInterruptedWorkflows,
} from '@src/hooks/useInterruptedWorkflows';
import { useMarketplaceOrder } from '@src/hooks/useMarketplaceOrder';
import {
  PendingWorkflow,
  usePendingWorkflows,
} from '@src/hooks/usePendingWorkflows';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import {
  ANTProcessData,
  useArNSState,
  useGlobalState,
  useModalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import { dispatchANTUpdate } from '@src/state/actions/dispatchANTUpdate';
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
  ARIO_DISCORD_LINK,
  ARNS_DOCS_LINK,
  MIN_ANT_VERSION,
  PERMANENT_DOMAIN_MESSAGE,
} from '@src/utils/constants';
import { ANTStateError } from '@src/utils/errors';
import { queryClient } from '@src/utils/network';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { capitalize } from 'lodash';
import { Activity, StoreIcon } from 'lucide-react';
import {
  AlertTriangle,
  CircleCheck,
  Copy,
  DollarSign,
  ExternalLink,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';

import { Tooltip } from '..';
import TableView from './TableView';
import UndernamesTable from './UndernamesTable';

type TableData = {
  openRow: ReactNode;
  name: string;
  role: string;
  processId: string;
  targetId: string;
  ioCompatible?: boolean | ANTStateError | string;
  undernames: {
    used: number;
    supported: number;
  };
  expiryDate: string;
  version: number;
  antErrors: Error[];
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

// Helper component for error state configuration
function ErrorStateTooltip({
  domainName,
  antId,
}: { domainName: string; antId: string }) {
  const [{ walletAddress }] = useWalletState();
  const [copied, setCopied] = useState(false);

  const errorConfig = {
    domainName,
    antId,
    userAddress: walletAddress?.toString() || 'N/A',
    timestamp: new Date().toISOString(),
    issue: 'Marketplace owns ANT but no order exists',
  };

  const configText = JSON.stringify(errorConfig, null, 2);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(configText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDiscordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(ARIO_DISCORD_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip
      message={
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-error" />
            <span className="text-sm font-medium text-error">
              Error State Detected
            </span>
          </div>

          <p className="text-xs text-grey">
            The marketplace owns this ANT but there is no corresponding order.
            This requires team intervention.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-2 py-1 bg-dark-grey rounded text-xs hover:bg-background-secondary transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy Config'}
            </button>

            <button
              onClick={handleDiscordClick}
              className="flex items-center gap-2 px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Report to Discord
            </button>
          </div>
        </div>
      }
      icon={
        <div className="relative">
          <AlertTriangle className="w-[18px] h-[18px] text-error hover:text-error transition-colors animate-pulse" />
        </div>
      }
    />
  );
}

// Helper component to determine the correct icon for marketplace-owned domains
function MarketplaceActionIcon({
  domainName,
  processId,
}: { domainName: string; processId: string }) {
  const { hasIntent } = useANTIntent(processId);

  const { data: order, error: orderError } = useMarketplaceOrder({
    antId: processId,
  });

  // If there's an intent but no order (or order fetch failed), show Activity icon
  const hasOrder = order && !orderError;

  // Error state: no intent and no order (marketplace owns ANT but nothing exists)
  if (!hasIntent && !hasOrder) {
    return <ErrorStateTooltip domainName={domainName} antId={processId} />;
  }

  if (hasIntent && !hasOrder) {
    return (
      <Tooltip
        message="Pending marketplace activity"
        icon={
          <div className="flex items-center justify-center w-[18px] h-[18px] text-orange-400 hover:text-orange-300 transition-colors">
            <Activity className="w-[18px] h-[18px]" />
          </div>
        }
      />
    );
  }

  // Default to marketplace store icon
  return (
    <Tooltip
      message="View in Marketplace"
      icon={
        <Link
          to={`/marketplace/names/${domainName}`}
          className="flex items-center justify-center w-[18px] h-[18px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          <StoreIcon className="w-[18px] h-[18px]" />
        </Link>
      }
    />
  );
}

// Helper component for interrupted workflow action
function InterruptedWorkflowAction({
  interruptedWorkflow,
}: {
  interruptedWorkflow: InterruptedWorkflow;
}) {
  const [showContinueWorkflowModal, setShowContinueWorkflowModal] =
    useState(false);

  return (
    <>
      <Tooltip
        message="Continue interrupted workflow"
        icon={
          <button onClick={() => setShowContinueWorkflowModal(true)}>
            <div className="relative">
              <AlertTriangle className="w-[18px] text-error hover:text-warning-light transition-colors animate-pulse" />
            </div>
          </button>
        }
      />
      {showContinueWorkflowModal && (
        <ContinueWorkflowModal
          show={showContinueWorkflowModal}
          onClose={() => setShowContinueWorkflowModal(false)}
          domainName={interruptedWorkflow.domainName}
          antId={interruptedWorkflow.antId}
          intentId={interruptedWorkflow.intent.intentId}
          workflowType={interruptedWorkflow.workflowType}
        />
      )}
    </>
  );
}

// Helper component for pending workflow action
// If there's an order for this domain, prefer displaying the order link instead
function PendingWorkflowAction({
  pendingWorkflow,
}: {
  pendingWorkflow: PendingWorkflow;
}) {
  const [showContinueWorkflowModal, setShowContinueWorkflowModal] =
    useState(false);

  const { data: order, error: orderError } = useMarketplaceOrder({
    antId: pendingWorkflow.antId,
  });

  // If there's an order, prefer displaying marketplace link
  const hasOrder = order && !orderError;
  if (hasOrder) {
    return (
      <Tooltip
        message="View in Marketplace"
        icon={
          <Link
            to={`/marketplace/names/${pendingWorkflow.domainName}`}
            className="flex items-center justify-center w-[18px] h-[18px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            <StoreIcon className="w-[18px] h-[18px]" />
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Tooltip
        message="Pending marketplace workflow - click to continue"
        icon={
          <button onClick={() => setShowContinueWorkflowModal(true)}>
            <div className="relative">
              <Activity className="w-[18px] h-[18px] text-orange-400 hover:text-orange-300 transition-colors animate-pulse" />
            </div>
          </button>
        }
      />
      {showContinueWorkflowModal && (
        <ContinueWorkflowModal
          show={showContinueWorkflowModal}
          onClose={() => setShowContinueWorkflowModal(false)}
          domainName={pendingWorkflow.domainName}
          antId={pendingWorkflow.antId}
          intentId={pendingWorkflow.intent.intentId}
          workflowType={InterruptedWorkflowType.TRANSFER}
        />
      )}
    </>
  );
}

// Helper component to display role with pending intent indicator
function RoleDisplay({
  role,
  domainName,
  processId,
}: {
  role: string;
  domainName: string;
  processId: string;
}) {
  const { hasIntent, intent } = useANTIntent(processId);
  const [showContinueWorkflowModal, setShowContinueWorkflowModal] =
    useState(false);

  if (role === 'marketplace') {
    // For marketplace role, check if there's a pending intent
    if (hasIntent && intent) {
      return (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContinueWorkflowModal(true)}
              className="relative flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <Activity className="w-4 h-4 text-error animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <span>Marketplace</span>
            </button>
          </div>
          {showContinueWorkflowModal && (
            <ContinueWorkflowModal
              show={showContinueWorkflowModal}
              onClose={() => setShowContinueWorkflowModal(false)}
              domainName={domainName}
              antId={processId}
              intentId={intent.intentId}
              workflowType={InterruptedWorkflowType.PUSH_INTENT}
            />
          )}
        </>
      );
    }

    // Normal marketplace display
    return (
      <div className="flex items-center gap-2">
        <StoreIcon className="w-4 h-4 text-blue-400" />
        <span>Marketplace</span>
      </div>
    );
  }

  // For other roles, check if there's a pending intent
  if (hasIntent && intent) {
    return (
      <>
        <button
          onClick={() => setShowContinueWorkflowModal(true)}
          className="relative flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <span>{capitalize(role)}</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </button>
        {showContinueWorkflowModal && (
          <ContinueWorkflowModal
            show={showContinueWorkflowModal}
            onClose={() => setShowContinueWorkflowModal(false)}
            domainName={domainName}
            antId={processId}
            intentId={intent.intentId}
            workflowType={InterruptedWorkflowType.TRANSFER}
          />
        )}
      </>
    );
  }

  // Normal role display
  return capitalize(role);
}

const DomainsTable = ({
  domainData,
  loading,
  filter = '',
  setFilter,
}: {
  domainData: {
    names: Record<string, AoArNSNameData>;
    ants: Record<string, ANTProcessData>;
  };
  loading: boolean;
  filter?: string;
  setFilter: (filter: string) => void;
}) => {
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();
  const [
    {
      arioProcessId,
      aoNetwork,
      hyperbeamUrl,
      antRegistryProcessId,
      gateway,
      minimumANTVersionForMarketplace,
      marketplaceProcessId,
    },
  ] = useGlobalState();
  const [{ loading: loadingArnsState }, dispatchArNSState] = useArNSState();
  const [, dispatchModalState] = useModalState();
  const [, dispatchTransactionState] = useTransactionState();
  const { data: latestAntVersion } = useLatestANTVersion();
  const { data: primaryNameData } = usePrimaryName();
  const { interruptedWorkflows } = useInterruptedWorkflows(
    domainData.ants,
    domainData.names,
  );
  const { getPendingWorkflowForDomain } = usePendingWorkflows(
    domainData.ants,
    domainData.names,
  );
  const [tableData, setTableData] = useState<Array<TableData>>([]);
  const [filteredTableData, setFilteredTableData] = useState<TableData[]>([]);
  const [showUpgradeDomainModal, setShowUpgradeDomainModal] =
    useState<boolean>(false);
  const [domainToUpgrade, setDomainToUpgrade] = useState<
    | {
        domain: string;
        processId: string;
      }
    | undefined
  >(undefined);

  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [selectedDomainForSale, setSelectedDomainForSale] = useState<{
    name: string;
    antId: string;
  } | null>(null);

  const [showUpgradeForMarketplaceModal, setShowUpgradeForMarketplaceModal] =
    useState(false);
  const [domainToUpgradeForMarketplace, setDomainToUpgradeForMarketplace] =
    useState<
      | {
          domain: string;
          processId: string;
        }
      | undefined
    >(undefined);

  // Helper function to check if ANT is marketplace compatible
  const isMarketplaceCompatible = (antVersion: number): boolean => {
    return antVersion >= minimumANTVersionForMarketplace;
  };

  // Helper function to check if a domain has an interrupted workflow
  const getInterruptedWorkflowForDomain = (
    domainName: string,
    antId: string,
  ) => {
    return interruptedWorkflows.find(
      (workflow) =>
        workflow.domainName === domainName && workflow.antId === antId,
    );
  };

  useEffect(() => {
    if (domainData) {
      const newTableData: TableData[] = [];

      Object.entries(domainData.names).map(([domain, record]) => {
        const ant = domainData.ants[record.processId];
        const ioCompatible =
          ant?.errors?.find((e) => e instanceof ANTStateError) ??
          (walletAddress && ant?.state && record?.processId
            ? !doAntsRequireUpdate({
                ants: {
                  [record.processId]: {
                    state: ant.state,
                    version: ant.version,
                    processMeta: ant.processMeta,
                  },
                },
                userAddress: walletAddress.toString(),
                currentModuleId: latestAntVersion?.moduleId ?? null,
              })
            : false);

        // Determine role including marketplace ownership
        const getRoleWithMarketplace = () => {
          const owner = ant?.state?.Owner;
          if (owner === marketplaceProcessId) {
            return 'marketplace';
          }
          return (
            getOwnershipStatus(
              owner,
              ant?.state?.Controllers,
              walletAddress?.toString(),
            ) ?? 'N/A'
          );
        };

        const data: TableData = {
          openRow: <></>,
          name: domain,
          role: getRoleWithMarketplace(),
          processId: record.processId,
          targetId: ant?.state?.Records?.['@']?.transactionId ?? 'N/A',
          ioCompatible,
          undernames: {
            used:
              Object.keys(ant?.state?.Records ?? {}).filter(
                (undername) => undername !== '@',
              )?.length ?? 0,
            supported: record.undernameLimit,
          },
          expiryDate: (record as any).endTimestamp ?? PERMANENT_DOMAIN_MESSAGE,
          action: <></>,
          // metadata used for search and other purposes
          antRecords: ant?.state?.Records,
          domainRecord: record,
          version: ant?.version ?? 0,
          antErrors: ant?.errors ?? [],
        };
        newTableData.push(data);
      });

      setTableData(newTableData);
    }
  }, [
    domainData,
    loading,
    loadingArnsState,
    primaryNameData,
    dispatchArNSState,
  ]);

  useEffect(() => {
    const filtered = filterTableData(filter, tableData);
    setFilteredTableData(filtered);
  }, [filter, tableData]);
  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    'openRow',
    'name',
    'role',
    'processId',
    'targetId',
    'undernames',
    'expiryDate',
    'ioCompatible',
    'action',
  ].map((key) =>
    columnHelper.accessor(key as keyof TableData, {
      id: key,
      size: key === 'action' || key === 'openRow' ? 20 : undefined,
      enableSorting: key !== 'action' && key !== 'openRow',
      header:
        key === 'action' || key === 'openRow'
          ? ''
          : key === 'processId'
            ? 'Process ID'
            : key === 'targetId'
              ? 'Target ID'
              : key === 'ioCompatible'
                ? 'AR.IO Compatible'
                : camelToReadable(key),
      sortDescFirst: true,
      sortingFn:
        key === 'undernames'
          ? (rowA, rowB) => {
              return (
                rowA.original.undernames.used - rowB.original.undernames.used
              );
            }
          : key === 'ioCompatible'
            ? (rowA) => {
                return typeof rowA.original.ioCompatible === 'boolean' &&
                  rowA.original.ioCompatible === true
                  ? 1
                  : 0;
              }
            : 'alphanumeric',
      cell: ({ row }) => {
        const processId = row.original.processId;
        const rowValue = row.getValue(key) as any;

        if (rowValue === undefined || rowValue === null) {
          return '';
        }

        if (loading && (rowValue === 'N/A' || rowValue instanceof Error)) {
          return <span className="animate-pulse text-white">Loading...</span>;
        }

        if (rowValue === 'N/A') {
          return rowValue;
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
              <div className="flex items-center gap-2">
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
                      className="link gap-2 w-fit whitespace-nowrap items-center"
                      to={`https://${encodeDomainToASCII(
                        row.getValue('name'),
                      )}.${gateway}`}
                      target="_blank"
                    >
                      {formatForMaxCharCount(decodeDomainToASCII(rowValue), 20)}{' '}
                      <ExternalLinkIcon className="size-3 fill-grey" />
                    </Link>
                  }
                />
              </div>
            );
          }
          case 'role': {
            const role = row.getValue(key) as string;
            const domainName = row.getValue('name') as string;
            const processId = row.getValue('processId') as string;

            return (
              <RoleDisplay
                role={role}
                domainName={domainName}
                processId={processId}
              />
            );
          }
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
            if (
              loadingArnsState &&
              !domainData.ants[row.original.processId]?.state
            )
              return (
                <span className="animate-pulse whitespace-nowrap">
                  Loading...
                </span>
              );
            if (rowValue instanceof ANTStateError && walletAddress) {
              return (
                <button
                  className="flex whitespace-nowrap justify-center align-center gap-2 text-center"
                  onClick={async () => {
                    dispatchANTUpdate({
                      processId,
                      domain: lowerCaseDomain(row.original.name),
                      aoNetwork,
                      queryClient,
                      walletAddress,
                      hyperbeamUrl,
                      dispatch: dispatchArNSState,
                      antRegistryProcessId,
                    });
                  }}
                >
                  Retry
                  <RefreshIcon
                    height={16}
                    width={16}
                    fill="var(--text-white)"
                  />
                </button>
              );
            }
            return rowValue === false && row.original.role !== 'controller' ? (
              <Tooltip
                message={'Upgrade Domain'}
                icon={
                  <button
                    onClick={() => {
                      setDomainToUpgrade({
                        domain: lowerCaseDomain(row.original.name),
                        processId: row.original.processId,
                      });
                      setShowUpgradeDomainModal(true);
                    }}
                    className="p-[4px] px-[8px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap"
                  >
                    Update
                  </button>
                }
              />
            ) : (
              <CircleCheck className="text-success w-[16px]" />
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
                    <div className="w-50 text-white text-center">
                      The first {supported} undernames for this name (ordered by
                      priority) will resolve on AR.IO gateways. Click{' '}
                      <Link
                        className="text-primary"
                        to={`/manage/names/${row.getValue(
                          'name',
                        )}/upgrade-undernames`}
                      >
                        here
                      </Link>{' '}
                      to increase the undername limit.
                    </div>
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
                        to={ARNS_DOCS_LINK}
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
                    className={`${
                      used >= supported ? 'text-warning' : 'link'
                    } max-w-fit`}
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
            if (rowValue === PERMANENT_DOMAIN_MESSAGE) {
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
          case 'action': {
            return (
              <div className="flex justify-end w-full">
                <span className="flex  pr-3 w-fit gap-3">
                  {row.getValue('role') === 'owner' ? (
                    <Tooltip
                      message={
                        row.original.version < MIN_ANT_VERSION
                          ? 'Update ANT to access Primary Names workflow'
                          : primaryNameData?.name === row.getValue('name')
                            ? 'Remove Primary Name'
                            : 'Set Primary Name'
                      }
                      icon={
                        <button
                          disabled={row.original.version < MIN_ANT_VERSION}
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
                              (row.getValue('name') === primaryNameData?.name
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
                  ) : (
                    <></>
                  )}
                  {(() => {
                    const domainName = row.getValue('name') as string;
                    const processId = row.getValue('processId') as string;
                    const role = row.getValue('role') as string;
                    const interruptedWorkflow = getInterruptedWorkflowForDomain(
                      domainName,
                      processId,
                    );
                    const pendingWorkflow = getPendingWorkflowForDomain(
                      domainName,
                      processId,
                    );

                    // If domain is owned by marketplace, show marketplace link or activity icon
                    if (role === 'marketplace' && !interruptedWorkflow) {
                      return (
                        <MarketplaceActionIcon
                          domainName={domainName}
                          processId={processId}
                        />
                      );
                    }

                    if (interruptedWorkflow) {
                      // If workflow type is unknown, show error state tooltip instead of continue modal
                      if (
                        interruptedWorkflow.workflowType ===
                        InterruptedWorkflowType.UNKNOWN
                      ) {
                        return (
                          <ErrorStateTooltip
                            domainName={domainName}
                            antId={processId}
                          />
                        );
                      }
                      // Show interrupted workflow icon for TRANSFER and PUSH_INTENT types
                      return (
                        <InterruptedWorkflowAction
                          interruptedWorkflow={interruptedWorkflow}
                        />
                      );
                    }

                    if (pendingWorkflow) {
                      // Show pending workflow icon - allows user to continue the workflow
                      return (
                        <PendingWorkflowAction
                          pendingWorkflow={pendingWorkflow}
                        />
                      );
                    }

                    // Only show marketplace listing icon for owners
                    if (role !== 'owner') {
                      return null;
                    }

                    // Show marketplace listing icon
                    return (
                      <Tooltip
                        message={
                          isMarketplaceCompatible(row.original.version)
                            ? 'List for Sale'
                            : `Upgrade to version ${minimumANTVersionForMarketplace}+ to list for sale`
                        }
                        icon={
                          <button
                            onClick={() => {
                              if (
                                isMarketplaceCompatible(row.original.version)
                              ) {
                                // ANT is marketplace compatible, proceed with listing
                                setSelectedDomainForSale({
                                  name: domainName,
                                  antId: processId,
                                });
                                setShowListForSaleModal(true);
                              } else {
                                // ANT needs upgrade for marketplace compatibility
                                setDomainToUpgradeForMarketplace({
                                  domain: lowerCaseDomain(domainName),
                                  processId: processId,
                                });
                                setShowUpgradeForMarketplaceModal(true);
                              }
                            }}
                          >
                            <DollarSign
                              className={`w-[18px] transition-colors ${
                                isMarketplaceCompatible(row.original.version)
                                  ? 'text-grey hover:text-white'
                                  : 'text-warning hover:text-warning-light'
                              }`}
                            />
                          </button>
                        }
                      />
                    );
                  })()}
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
          data={filteredTableData}
          isLoading={false}
          onRowClick={(rowData, tableRow) => {
            if (tableRow) {
              tableRow.toggleExpanded();
            }
            return rowData;
          }}
          tableClass={
            filteredTableData.length > 0 ? 'border-b border-dark-grey' : ''
          }
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
            ) : // if a filter is provided, show the no data found message
            filter && filter.length > 0 ? (
              <div className="flex flex-column center p-[100px]">
                <span className="white bold" style={{ fontSize: '16px' }}>
                  No results found for &apos;{filter}&apos;
                </span>
                <button
                  onClick={() => {
                    setFilter('');
                  }}
                  className="button-secondary center p-[10px] w-fit"
                >
                  Clear filter
                </button>
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
                    className="bg-primary rounded-md text-black center hover px-4 py-3 text-sm hover:scale-105"
                  >
                    Register a Name
                  </Link>
                </div>
              </div>
            )
          }
          defaultSortingState={{ id: 'name', desc: false }}
          renderSubComponent={({ row }) => (
            <UndernamesTable
              isLoading={false}
              undernames={
                domainData.ants?.[row.getValue('processId') as string]?.state
                  ?.Records ?? {}
              }
              arnsRecord={{
                name: row.getValue('name'),
                version: row.original.version,
                undernameLimit: row.original.undernames.supported,
                processId: row.getValue('processId'),
              }}
              state={
                domainData.ants?.[row.getValue('processId') as string]?.state
              }
            />
          )}
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
      {domainToUpgrade && (
        <UpgradeDomainModal
          domain={domainToUpgrade.domain}
          processId={domainToUpgrade.processId}
          visible={showUpgradeDomainModal}
          setVisible={(b: boolean) => {
            setShowUpgradeDomainModal(b);
            setDomainToUpgrade(undefined);
          }}
        />
      )}
      {selectedDomainForSale && (
        <ListNameForSaleModal
          show={showListForSaleModal}
          onClose={() => {
            setShowListForSaleModal(false);
            setSelectedDomainForSale(null);
          }}
          domainName={selectedDomainForSale.name}
          antId={selectedDomainForSale.antId}
        />
      )}
      {domainToUpgradeForMarketplace && (
        <UpgradeDomainForMarketplaceModal
          domain={domainToUpgradeForMarketplace.domain}
          processId={domainToUpgradeForMarketplace.processId}
          visible={showUpgradeForMarketplaceModal}
          setVisible={(b: boolean) => {
            setShowUpgradeForMarketplaceModal(b);
            setDomainToUpgradeForMarketplace(undefined);
          }}
          onUpgradeComplete={() => {
            // After successful upgrade, show the list for sale modal
            if (domainToUpgradeForMarketplace) {
              setSelectedDomainForSale({
                name: domainToUpgradeForMarketplace.domain,
                antId: domainToUpgradeForMarketplace.processId,
              });
              setShowListForSaleModal(true);
            }
          }}
        />
      )}
    </>
  );
};

export default DomainsTable;
