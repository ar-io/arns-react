import { isLeasedArNSRecord } from '@ar.io/sdk';
import LeaseDuration from '@src/components/data-display/LeaseDuration';
import { Loader } from '@src/components/layout';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ANT_INTERACTION_TYPES } from '@src/types';
import { formatExpiryDate } from '@src/utils';
import { DEFAULT_MAX_UNDERNAMES } from '@src/utils/constants';
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
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useDomainInfo({ domain, antId });
  const [{ wallet, walletAddress }] = useWalletState();

  useEffect(() => {
    refetch();
  }, [interactionResult]);

  if (!wallet?.arconnectSigner || !walletAddress) {
    navigate('/connect');
    return;
  }

  if (isLoading) {
    return <Loader />;
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
                value={data.associatedNames ?? 'N/A'}
                key={DomainSettingsRowTypes.ASSOCIATED_NAMES}
              />
            ),
            [DomainSettingsRowTypes.NICKNAME]: (
              <NicknameRow
                nickname={data.name}
                key={DomainSettingsRowTypes.NICKNAME}
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
                targetId={data.apexRecord.transactionId}
                key={DomainSettingsRowTypes.TARGET_ID}
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
                ttlSeconds={data.apexRecord.ttlSeconds}
                key={DomainSettingsRowTypes.TTL}
                confirm={(ttlSeconds: number) =>
                  dispatchANTInteraction({
                    payload: {
                      ttlSeconds,
                      transactionId: data.apexRecord.transactionId,
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
