import LeaseDuration from '@src/components/data-display/LeaseDuration';
import { isLeasedRecord } from '@src/components/layout/ExtendLease/ExtendLease';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { ANT_INTERACTION_TYPES } from '@src/types';
import { formatExpiryDate, getUndernameCount } from '@src/utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  SECONDS_IN_GRACE_PERIOD,
} from '@src/utils/constants';
import { List, Skeleton } from 'antd';
import { useEffect } from 'react';

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
  const [{ interactionResult }, dispatch] = useTransactionState();
  const { data, isLoading, refetch } = useDomainInfo({ domain, antId });

  useEffect(() => {
    refetch();
  }, [interactionResult]);

  function getStatus(endTimestamp?: number) {
    if (!endTimestamp) {
      // assumes permabuy
      return 'Active';
    }
    const now = Date.now();
    if (endTimestamp < now) {
      return 'Expired';
    }
    if (endTimestamp - SECONDS_IN_GRACE_PERIOD * 1000 < now / 1000) {
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
                value={
                  isLoading ? (
                    <Skeleton.Input active />
                  ) : data.arnsRecord && isLeasedRecord(data.arnsRecord) ? (
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
                value={
                  isLoading ? (
                    <Skeleton.Input active />
                  ) : (
                    <LeaseDuration
                      startTimestamp={data.arnsRecord?.startTimestamp}
                      endTimestamp={
                        data.arnsRecord && isLeasedRecord(data.arnsRecord)
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
                value={data.associatedNames ?? 'N/A'}
              />
            ),
            [DomainSettingsRowTypes.STATUS]: (
              <DomainSettingsRow
                label="Status"
                value={
                  data.arnsRecord && isLeasedRecord(data.arnsRecord)
                    ? getStatus(data.arnsRecord?.endTimestamp)
                    : 'Active'
                }
              />
            ),
            [DomainSettingsRowTypes.NICKNAME]: (
              <NicknameRow
                nickname={data?.antState?.name}
                confirm={(name: string) =>
                  dispatchANTInteraction({
                    payload: { name },
                    workflowName: ANT_INTERACTION_TYPES.SET_NAME,
                    antProvider: data.antProvider,
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.PROCESS_ID]: (
              <DomainSettingsRow
                label="Process ID"
                value={
                  data?.processId ? (
                    data.processId.toString()
                  ) : (
                    <Skeleton.Input active />
                  )
                }
              />
            ),
            [DomainSettingsRowTypes.TARGET_ID]: (
              <TargetIDRow
                targetId={data.antState?.records?.['@'].transactionId}
                confirm={(targetId: string) =>
                  dispatchANTInteraction({
                    payload: {
                      transactionId: targetId,
                      ttlSeconds: data.antState?.records?.['@'].ttlSeconds,
                    },
                    workflowName: ANT_INTERACTION_TYPES.SET_TARGET_ID,
                    antProvider: data.antProvider,
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.TICKER]: (
              <TickerRow
                ticker={data.antState?.ticker}
                confirm={(ticker: string) =>
                  dispatchANTInteraction({
                    payload: { ticker },
                    workflowName: ANT_INTERACTION_TYPES.SET_TICKER,
                    antProvider: data.antProvider,
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.CONTROLLERS]: (
              <ControllersRow
                state={data?.antState}
                processId={data?.processId?.toString()}
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
                    antProvider: data.antProvider,
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.OWNER]: (
              <OwnerRow
                processId={data?.processId?.toString()}
                state={data?.antState}
                associatedNames={data?.associatedNames ?? []}
                confirm={({ target }: { target: string }) =>
                  dispatchANTInteraction({
                    payload: { target },
                    workflowName: ANT_INTERACTION_TYPES.TRANSFER,
                    antProvider: data.antProvider,
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.TTL]: (
              <TTLRow
                ttlSeconds={data?.antState?.records?.['@'].ttlSeconds}
                confirm={(ttlSeconds: number) =>
                  dispatchANTInteraction({
                    payload: {
                      ttlSeconds,
                      transactionId:
                        data?.antState?.records?.['@'].transactionId,
                    },
                    workflowName: ANT_INTERACTION_TYPES.SET_TTL_SECONDS,
                    antProvider: data.antProvider,
                    processId: data.processId,
                    dispatch,
                  })
                }
              />
            ),
            [DomainSettingsRowTypes.UNDERNAMES]: (
              <UndernamesRow
                domain={domain}
                antId={data?.processId?.toString()}
                undernameCount={getUndernameCount(
                  data?.antState?.records ?? {},
                )}
                undernameSupport={
                  data?.arnsRecord?.undernames ?? DEFAULT_MAX_UNDERNAMES
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
