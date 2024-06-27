import { isLeasedArNSRecord } from '@ar.io/sdk/web';
import LeaseDuration from '@src/components/data-display/LeaseDuration';
import { Loader } from '@src/components/layout';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { useArNSState } from '@src/state/contexts/ArNSState';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ANT_INTERACTION_TYPES } from '@src/types';
import { decodeDomainToASCII, formatExpiryDate } from '@src/utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  SECONDS_IN_GRACE_PERIOD,
} from '@src/utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import { List, Skeleton } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import ControllersRow from './ControllersRow';
import DomainSettingsRow from './DomainSettingsRow';
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
  NICKNAME = 'Nickname',
  PROCESS_ID = 'Process ID',
  TARGET_ID = 'Target ID',
  TICKER = 'Ticker',
  CONTROLLERS = 'Controllers',
  OWNER = 'Owner',
  TTL = 'TTL Seconds',
  UNDERNAMES = 'Undernames',
}

function DomainSettings({
  domain,
  antId,
  rowFilter = [],
}: {
  domain?: string;
  antId?: ArweaveTransactionID;
  rowFilter?: DomainSettingsRowTypes[];
}) {
  const queryClient = useQueryClient();

  const [{ interactionResult }, dispatch] = useTransactionState();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useDomainInfo({ domain, antId });
  const [{ wallet, walletAddress }] = useWalletState();

  // permissions check
  const [{ ants }] = useArNSState();
  const isOwner =
    ants[data.processId?.toString()]?.Owner === walletAddress?.toString();
  const isController = ants[data.processId?.toString()]?.Controllers?.includes(
    walletAddress?.toString() ?? '',
  );
  const isAuthorized = isOwner ?? isController;

  useEffect(() => {
    if (interactionResult) {
      queryClient.invalidateQueries({
        queryKey: ['arns-records'],
        refetchType: 'all',
      });

      if (domain) {
        queryClient.invalidateQueries({
          queryKey: ['arns-record', { domain }],
          refetchType: 'all',
        });
      }

      if (data?.processId) {
        queryClient.invalidateQueries({
          queryKey: ['ant', data.processId.toString()],
          refetchType: 'all',
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['domainInfo'],
        refetchType: 'all',
      });

      refetch();
    }
  }, [interactionResult]);

  if (!wallet?.arconnectSigner || !walletAddress) {
    navigate('/connect');
    return;
  }

  if (isLoading) {
    return <Loader />;
  }

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
        {data &&
          Object.entries({
            [DomainSettingsRowTypes.EXPIRY_DATE]: (
              <DomainSettingsRow
                label="Expiry Date"
                key={DomainSettingsRowTypes.EXPIRY_DATE}
                value={
                  isLoading ? (
                    <Skeleton.Input active />
                  ) : data.arnsRecord && isLeasedArNSRecord(data.arnsRecord) ? (
                    formatExpiryDate(data.arnsRecord?.endTimestamp)
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
                value={
                  isLoading ? (
                    <Skeleton.Input active />
                  ) : (
                    <LeaseDuration
                      startTimestamp={data.arnsRecord?.startTimestamp}
                      endTimestamp={
                        data.arnsRecord && isLeasedArNSRecord(data.arnsRecord)
                          ? data.arnsRecord?.endTimestamp
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
                  data.associatedNames
                    ?.map((d) => decodeDomainToASCII(d))
                    .join(', ') ?? 'N/A'
                }
                key={DomainSettingsRowTypes.ASSOCIATED_NAMES}
              />
            ),
            [DomainSettingsRowTypes.STATUS]: (
              <DomainSettingsRow
                label="Status"
                value={
                  data.arnsRecord && isLeasedArNSRecord(data.arnsRecord)
                    ? getStatus(data.arnsRecord?.endTimestamp)
                    : 'Active'
                }
                key={DomainSettingsRowTypes.STATUS}
              />
            ),
            [DomainSettingsRowTypes.NICKNAME]: (
              <NicknameRow
                nickname={decodeDomainToASCII(data.name ?? '')}
                key={DomainSettingsRowTypes.NICKNAME}
                editable={isController}
                confirm={(name: string) =>
                  dispatchANTInteraction({
                    payload: { name },
                    workflowName: ANT_INTERACTION_TYPES.SET_NAME,
                    processId: data.processId,
                    signer: wallet.arconnectSigner!,
                    owner: walletAddress.toString(),
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.PROCESS_ID]: (
              <DomainSettingsRow
                label="Process ID"
                key={DomainSettingsRowTypes.PROCESS_ID}
                value={
                  data.processId ? (
                    data.processId.toString()
                  ) : (
                    <Skeleton.Input active />
                  )
                }
              />
            ),
            [DomainSettingsRowTypes.TARGET_ID]: (
              <TargetIDRow
                targetId={data?.apexRecord?.transactionId}
                key={DomainSettingsRowTypes.TARGET_ID}
                editable={isController}
                confirm={(targetId: string) =>
                  dispatchANTInteraction({
                    payload: {
                      transactionId: targetId,
                      ttlSeconds: data.apexRecord.ttlSeconds,
                    },
                    workflowName: ANT_INTERACTION_TYPES.SET_TARGET_ID,
                    signer: wallet.arconnectSigner!,
                    owner: walletAddress.toString(),
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.TICKER]: (
              <TickerRow
                ticker={data.ticker}
                key={DomainSettingsRowTypes.TICKER}
                editable={isController}
                confirm={(ticker: string) =>
                  dispatchANTInteraction({
                    payload: { ticker },
                    workflowName: ANT_INTERACTION_TYPES.SET_TICKER,
                    signer: wallet.arconnectSigner!,
                    owner: walletAddress.toString(),
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.CONTROLLERS]: (
              <ControllersRow
                key={DomainSettingsRowTypes.CONTROLLERS}
                processId={data.processId?.toString()}
                editable={isController}
                controllers={data.controllers}
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
                    signer: wallet.arconnectSigner!,
                    owner: walletAddress.toString(),
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.OWNER]: (
              <OwnerRow
                owner={data.owner}
                processId={data.processId?.toString()}
                key={DomainSettingsRowTypes.OWNER}
                associatedNames={data.associatedNames ?? []}
                editable={isOwner}
                confirm={({ target }: { target: string }) =>
                  dispatchANTInteraction({
                    payload: { target },
                    workflowName: ANT_INTERACTION_TYPES.TRANSFER,
                    signer: wallet.arconnectSigner!,
                    owner: walletAddress.toString(),
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.TTL]: (
              <TTLRow
                ttlSeconds={data.apexRecord?.ttlSeconds}
                editable={isController}
                key={DomainSettingsRowTypes.TTL}
                confirm={(ttlSeconds: number) =>
                  dispatchANTInteraction({
                    payload: {
                      ttlSeconds,
                      transactionId: data.apexRecord?.transactionId,
                    },
                    workflowName: ANT_INTERACTION_TYPES.SET_TTL_SECONDS,
                    signer: wallet.arconnectSigner!,
                    owner: walletAddress.toString(),
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.UNDERNAMES]: (
              <UndernamesRow
                key={DomainSettingsRowTypes.UNDERNAMES}
                domain={domain}
                antId={data.processId?.toString()}
                undernameLimit={data.undernameCount ?? 0}
                undernameSupport={
                  data.arnsRecord?.undernameLimit ?? DEFAULT_MAX_UNDERNAMES
                }
              />
            ),
          }).map(([rowName, row]) =>
            rowFilter.includes(rowName as DomainSettingsRowTypes) ? <></> : row,
          )}
      </List>
    </>
  );
}

export default DomainSettings;
