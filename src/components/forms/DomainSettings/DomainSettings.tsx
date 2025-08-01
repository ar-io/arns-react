import { isLeasedArNSRecord } from '@ar.io/sdk/web';
import { Tooltip } from '@src/components/data-display';
import LeaseDuration from '@src/components/data-display/LeaseDuration';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ReassignNameModal } from '@src/components/modals/ant-management/ReassignNameModal/ReassignNameModal';
import { ReturnNameModal } from '@src/components/modals/ant-management/ReturnNameModal/ReturnNameModal';
import { useLatestANTVersion } from '@src/hooks/useANTVersions';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useArNSState, useGlobalState } from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ANT_INTERACTION_TYPES } from '@src/types';
import {
  decodeDomainToASCII,
  doAntsRequireUpdate,
  formatExpiryDate,
  lowerCaseDomain,
} from '@src/utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  MIN_ANT_VERSION,
  SECONDS_IN_GRACE_PERIOD,
} from '@src/utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import { List, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ControllersRow from './ControllersRow';
import DescriptionRow from './DescriptionRow';
import DomainSettingsRow from './DomainSettingsRow';
import IOCompatibleRow from './IOCompatibleRow';
import KeywordsRow from './KeywordRow';
import LogoRow from './LogoRow';
import NicknameRow from './NicknameRow';
import OwnerRow from './OwnerRow';
import TTLRow from './TTLRow';
import TargetIDRow from './TargetIDRow';
import TickerRow from './TickerRow';
import UndernamesRow from './UndernamesRow';
import './styles.css';

export enum DomainSettingsRowTypes {
  EXPIRY_DATE = 'Expiry Date',
  LEASE_DURATION = 'Lease Duration',
  ASSOCIATED_NAMES = 'Associated Names',
  STATUS = 'Status',
  IO_COMPATIBLE = 'IO Compatible',
  NICKNAME = 'Nickname',
  PROCESS_ID = 'Process ID',
  TARGET_ID = 'Target ID',
  TICKER = 'Ticker',
  CONTROLLERS = 'Controllers',
  OWNER = 'Owner',
  TTL = 'TTL Seconds',
  UNDERNAMES = 'Undernames',
  LOGO_TX_ID = 'Logo TX ID',
  DESCRIPTION = 'Description',
  KEYWORDS = 'Keywords',
}

function DomainSettings({
  domain,
  antId,
  rowFilter = [],
  setLogo,
}: {
  domain?: string;
  antId?: string;
  rowFilter?: DomainSettingsRowTypes[];
  setLogo?: (id?: string) => void;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [{ arioProcessId, antAoClient, hyperbeamUrl }] = useGlobalState();
  const [{ interactionResult }, dispatchTransactionState] =
    useTransactionState();
  const [, dispatchArNSState] = useArNSState();
  const { data: antVersion } = useLatestANTVersion();
  const antModuleId = antVersion?.moduleId ?? null;
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: primaryNameData } = usePrimaryName();
  const { data, isLoading, refetch } = useDomainInfo({ domain, antId });

  const [showReturnNameModal, setShowReturnNameModal] = useState(false);
  const [showReassignNameModal, setShowReassignNameModal] = useState(false);

  // permissions check
  const isOwner = walletAddress
    ? data?.owner === walletAddress.toString()
    : false;
  const isController = walletAddress
    ? data?.controllers?.includes(walletAddress.toString() ?? '')
    : false;
  const isAuthorized = (isOwner || isController) ?? false;

  useEffect(() => {
    if (!domain && !antId) {
      navigate('/manage/names');
    }
  }, [domain, antId]);

  // callback to set logo
  useEffect(() => {
    if (setLogo && data?.logo) setLogo(data.logo);
  }, [data?.logo, setLogo]);

  useEffect(() => {
    if (interactionResult) {
      queryClient.invalidateQueries({
        queryKey: ['arns-records'],
        refetchType: 'all',
      });

      queryClient.invalidateQueries({
        queryKey: ['domainInfo', domain],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['domainInfo', data?.processId.toString()],
        refetchType: 'all',
      });

      refetch();
    }
  }, [interactionResult]);

  function getStatus(endTimestamp?: number) {
    if (!endTimestamp) {
      return 'Active';
    }
    const now = Date.now();
    if (endTimestamp < now) {
      return 'Expired';
    }
    if (endTimestamp - SECONDS_IN_GRACE_PERIOD < now) {
      return 'In Grace Period';
    }
    return 'Active';
  }

  return (
    <>
      <List prefixCls="domain-settings-list">
        {Object.entries({
          [DomainSettingsRowTypes.EXPIRY_DATE]: (
            <DomainSettingsRow
              label="Expiry Date"
              key={DomainSettingsRowTypes.EXPIRY_DATE}
              value={
                isLoading ? (
                  <Skeleton.Input active />
                ) : data?.arnsRecord && isLeasedArNSRecord(data?.arnsRecord) ? (
                  formatExpiryDate(data?.arnsRecord?.endTimestamp)
                ) : (
                  'N/A'
                )
              }
            />
          ),
          [DomainSettingsRowTypes.LEASE_DURATION]: (
            <DomainSettingsRow
              label="Lease Duration"
              key={DomainSettingsRowTypes.LEASE_DURATION}
              editable={true}
              action={
                <div
                  className="flex flex-row flex-right gap-1"
                  style={{ gap: '10px' }}
                >
                  {data?.arnsRecord?.type == 'permabuy' && isOwner ? (
                    <Tooltip
                      message={
                        primaryNameData?.name === lowerCaseDomain(domain ?? '')
                          ? 'Cannot return ArNS name while set as primary name. Remove name as primary name to enable return name workflow.'
                          : data.version < MIN_ANT_VERSION
                          ? 'Update Domain to access Release Name workflow'
                          : 'Returns the name to the ArNS protocol'
                      }
                      icon={
                        <button
                          disabled={
                            primaryNameData?.name ===
                              lowerCaseDomain(domain ?? '') ||
                            data.version < MIN_ANT_VERSION
                          }
                          onClick={() => setShowReturnNameModal(true)}
                          className={`text-xs rounded-[4px] py-[.375rem] px-[.625rem]  border border-error bg-error-thin text-error whitespace-nowrap`}
                        >
                          Return
                        </button>
                      }
                    />
                  ) : (
                    <Tooltip
                      message={'Extend lease'}
                      icon={
                        <button
                          className={`p-[6px] px-[10px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap hover `}
                          onClick={() =>
                            navigate(
                              `/manage/names/${lowerCaseDomain(
                                domain!,
                              )}/extend`,
                            )
                          }
                        >
                          Extend Lease
                        </button>
                      }
                    />
                  )}
                </div>
              }
              value={
                isLoading ? (
                  <Skeleton.Input active />
                ) : (
                  <LeaseDuration
                    startTimestamp={data?.arnsRecord?.startTimestamp}
                    endTimestamp={
                      data?.arnsRecord && isLeasedArNSRecord(data?.arnsRecord)
                        ? data?.arnsRecord?.endTimestamp
                        : 0
                    }
                  />
                )
              }
            />
          ),
          [DomainSettingsRowTypes.ASSOCIATED_NAMES]: (
            <DomainSettingsRow
              label="Associated Names"
              value={
                data?.associatedNames ? (
                  data?.associatedNames
                    .map((d) => decodeDomainToASCII(d))
                    .join(', ') ?? 'N/A'
                ) : (
                  <Skeleton.Input active />
                )
              }
              key={DomainSettingsRowTypes.ASSOCIATED_NAMES}
            />
          ),
          [DomainSettingsRowTypes.STATUS]: (
            <DomainSettingsRow
              label="Status"
              value={
                data?.arnsRecord && isLeasedArNSRecord(data?.arnsRecord)
                  ? getStatus(data?.arnsRecord?.endTimestamp)
                  : 'Active'
              }
              key={DomainSettingsRowTypes.STATUS}
            />
          ),
          [DomainSettingsRowTypes.IO_COMPATIBLE]: (
            <IOCompatibleRow
              domain={domain}
              editable={data?.state ? isAuthorized : true}
              requiresUpdate={
                data?.processId && data?.state && walletAddress
                  ? doAntsRequireUpdate({
                      ants: {
                        [data.processId]: {
                          state: data.state,
                          version: data.version,
                          processMeta: data.processMeta ?? null,
                        },
                      },
                      userAddress: walletAddress.toString(),
                      currentModuleId: antModuleId,
                    })
                  : data?.processId
                  ? true
                  : false
              }
            />
          ),
          [DomainSettingsRowTypes.NICKNAME]: (
            <NicknameRow
              nickname={decodeDomainToASCII(data?.name ?? '')}
              key={DomainSettingsRowTypes.NICKNAME}
              editable={isAuthorized}
              confirm={(name: string) =>
                dispatchANTInteraction({
                  payload: { name },
                  workflowName: ANT_INTERACTION_TYPES.SET_NAME,
                  processId: data!.processId,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.PROCESS_ID]: (
            <DomainSettingsRow
              label="Process ID"
              key={DomainSettingsRowTypes.PROCESS_ID}
              value={
                data?.processId && !isLoading ? (
                  <ArweaveID
                    id={new ArweaveTransactionID(data.processId.toString())}
                    shouldLink
                    type={ArweaveIdTypes.CONTRACT}
                  />
                ) : (
                  <Skeleton.Input active />
                )
              }
              editable={isOwner}
              action={
                <Tooltip
                  message={
                    data?.version && data.version < MIN_ANT_VERSION
                      ? 'Update Domain to access Reassign Name workflow'
                      : data?.isInGracePeriod
                      ? 'Lease must be extended before ANT can be Reassigned'
                      : 'Reassigns what ANT is registered to the ArNS Name'
                  }
                  icon={
                    <button
                      disabled={
                        (data?.version && data.version < MIN_ANT_VERSION) ||
                        data?.isInGracePeriod
                      }
                      onClick={() => setShowReassignNameModal(true)}
                      className={`flex flex-row text-[12px] rounded-[4px] p-[6px] px-[10px] border border-error bg-error-thin text-error whitespace-nowrap`}
                    >
                      Reassign
                    </button>
                  }
                />
              }
            />
          ),
          [DomainSettingsRowTypes.TARGET_ID]: (
            <TargetIDRow
              targetId={data?.apexRecord?.transactionId}
              key={DomainSettingsRowTypes.TARGET_ID}
              editable={isAuthorized}
              confirm={(targetId: string) =>
                dispatchANTInteraction({
                  payload: {
                    transactionId: targetId,
                    ttlSeconds: data?.apexRecord?.ttlSeconds,
                  },
                  workflowName: ANT_INTERACTION_TYPES.SET_TARGET_ID,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.TICKER]: (
            <TickerRow
              ticker={data?.ticker}
              key={DomainSettingsRowTypes.TICKER}
              editable={isAuthorized}
              confirm={(ticker: string) =>
                dispatchANTInteraction({
                  payload: { ticker },
                  workflowName: ANT_INTERACTION_TYPES.SET_TICKER,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.CONTROLLERS]: (
            <ControllersRow
              key={DomainSettingsRowTypes.CONTROLLERS}
              processId={data?.processId?.toString() ?? ''}
              editable={isAuthorized}
              controllers={data?.controllers ?? []}
              confirm={({
                payload,
                workflowName,
              }: {
                payload: { controller: string };
                workflowName:
                  | ANT_INTERACTION_TYPES.SET_CONTROLLER
                  | ANT_INTERACTION_TYPES.REMOVE_CONTROLLER;
              }) =>
                dispatchANTInteraction({
                  payload,
                  workflowName,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.OWNER]: (
            <OwnerRow
              owner={data?.owner ?? 'N/A'}
              processId={data?.processId?.toString() ?? ''}
              key={DomainSettingsRowTypes.OWNER}
              associatedNames={data?.associatedNames ?? []}
              editable={isOwner}
              confirm={({ target }: { target: string }) =>
                dispatchANTInteraction({
                  payload: {
                    target,
                    ...(data?.version && data.version < MIN_ANT_VERSION
                      ? { arnsDomain: domain, arioProcessId }
                      : {}),
                  },
                  workflowName: ANT_INTERACTION_TYPES.TRANSFER,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.TTL]: (
            <TTLRow
              ttlSeconds={data?.apexRecord?.ttlSeconds}
              editable={isAuthorized}
              key={DomainSettingsRowTypes.TTL}
              confirm={(ttlSeconds: number) =>
                dispatchANTInteraction({
                  payload: {
                    ttlSeconds,
                    transactionId: data?.apexRecord?.transactionId,
                  },
                  workflowName: ANT_INTERACTION_TYPES.SET_TTL_SECONDS,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.UNDERNAMES]: (
            <UndernamesRow
              key={DomainSettingsRowTypes.UNDERNAMES}
              domain={domain}
              antId={data?.processId?.toString()}
              undernameLimit={data?.undernameCount ?? 0}
              undernameSupport={
                data?.arnsRecord?.undernameLimit ?? DEFAULT_MAX_UNDERNAMES
              }
            />
          ),
          [DomainSettingsRowTypes.LOGO_TX_ID]: (
            <LogoRow
              key={DomainSettingsRowTypes.LOGO_TX_ID}
              logoTxId={data?.logo}
              editable={isAuthorized}
              confirm={(logo: string) =>
                dispatchANTInteraction({
                  payload: {
                    logo,
                  },
                  workflowName: ANT_INTERACTION_TYPES.SET_LOGO,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.DESCRIPTION]: (
            <DescriptionRow
              key={DomainSettingsRowTypes.DESCRIPTION}
              description={data?.state?.Description}
              editable={isAuthorized}
              confirm={(description: string) =>
                dispatchANTInteraction({
                  payload: {
                    description,
                  },
                  workflowName: ANT_INTERACTION_TYPES.SET_DESCRIPTION,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
          [DomainSettingsRowTypes.KEYWORDS]: (
            <KeywordsRow
              key={DomainSettingsRowTypes.KEYWORDS}
              keywords={data?.state?.Keywords ?? []}
              editable={isAuthorized}
              confirm={(keywords: string[]) =>
                dispatchANTInteraction({
                  payload: {
                    keywords,
                  },
                  workflowName: ANT_INTERACTION_TYPES.SET_KEYWORDS,
                  signer: wallet!.contractSigner!,
                  owner: walletAddress!.toString(),
                  processId: data!.processId,
                  dispatchTransactionState,
                  dispatchArNSState,
                  ao: antAoClient,
                  hyperbeamUrl,
                })
              }
            />
          ),
        }).map(([rowName, row]) =>
          rowFilter.includes(rowName as DomainSettingsRowTypes) ? <></> : row,
        )}
      </List>

      {domain && data?.processId && (
        <ReturnNameModal
          show={showReturnNameModal}
          setShow={setShowReturnNameModal}
          name={domain}
          processId={data.processId}
        />
      )}
      {domain && data?.processId && (
        <ReassignNameModal
          show={showReassignNameModal}
          setShow={setShowReassignNameModal}
          name={domain}
          processId={data.processId}
        />
      )}
    </>
  );
}

export default DomainSettings;
