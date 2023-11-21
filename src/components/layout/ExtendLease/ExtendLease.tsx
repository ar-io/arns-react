import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  ARNSRecordEntry,
  ExtendLeasePayload,
  INTERACTION_NAMES,
  INTERACTION_TYPES,
  TRANSACTION_TYPES,
} from '../../../types';
import {
  getLeaseDurationFromEndTimestamp,
  lowerCaseDomain,
  sleep,
} from '../../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  YEAR_IN_MILLISECONDS,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { ARNSCard } from '../../cards';
import { InfoIcon } from '../../icons';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import DialogModal from '../../modals/DialogModal/DialogModal';
import TransactionCost from '../TransactionCost/TransactionCost';
import PageLoader from '../progress/PageLoader/PageLoader';

function ExtendLease() {
  // TODO: remove use of source contract
  const [{ arweaveDataProvider, ioTicker }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [, dispatchTransactionState] = useTransactionState();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.pathname.split('/').at(-2);
  const [record, setRecord] = useState<ARNSRecordEntry>();
  const [registrationType, setRegistrationType] = useState<TRANSACTION_TYPES>();
  const [newLeaseDuration, setNewLeaseDuration] = useState<number>(1);
  const [maxIncrease, setMaxIncrease] = useState<number>(0);
  const [ioFee, setIoFee] = useState<number | undefined>();
  const [ioBalance, setIoBalance] = useState<number>(0);

  useEffect(() => {
    if (!name) {
      navigate(`/manage/names`);
      return;
    }
    onLoad(lowerCaseDomain(name));
  }, [name]);

  useEffect(() => {
    if (!record || !record.endTimestamp || !name) {
      return;
    }

    setIoFee(undefined);
    const updateIoFee = async () => {
      const price = await arweaveDataProvider
        .getPriceForInteraction({
          interactionName: INTERACTION_NAMES.EXTEND_RECORD,
          payload: {
            name: name,
            years: newLeaseDuration,
          },
        })
        .catch(() => {
          eventEmitter.emit(
            'error',
            new Error('Unable to get price for extend lease'),
          );
          return -1;
        });

      setIoFee(price);
    };
    updateIoFee();
  }, [newLeaseDuration, maxIncrease, record, name]);

  async function onLoad(domain: string) {
    try {
      const domainRecord = await arweaveDataProvider.getRecord({ domain });
      if (!domainRecord?.type) {
        throw new Error(`Unable to get record for ${domain}`);
      }
      setRegistrationType(domainRecord.type);

      setRecord(domainRecord);

      if (!domainRecord.endTimestamp) {
        setRegistrationType(TRANSACTION_TYPES.BUY);
        return;
      }
      const balance = await arweaveDataProvider.getTokenBalance(
        walletAddress!,
        ARNS_REGISTRY_ADDRESS,
      );

      setIoBalance(balance ?? 0);

      setMaxIncrease(
        Math.max(
          0,
          MAX_LEASE_DURATION -
            getLeaseDurationFromEndTimestamp(
              // TODO: remove this when state in contract is fixed. (currently was backfilled incorrectly with ms timestamps)
              domainRecord.startTimestamp > domainRecord.endTimestamp
                ? domainRecord.startTimestamp
                : domainRecord.startTimestamp * 1000,
              domainRecord.endTimestamp * 1000,
            ),
        ),
      );
    } catch (error) {
      eventEmitter.emit('error', error);
      // sleep 2000 to make page transition less jarring
      await sleep(2000);
      navigate(`/manage/names`);
    }
  }

  if (!record || !name) {
    return (
      <PageLoader loading={!record} message={`Loading info for ${name}`} />
    );
  }

  if (!record.endTimestamp || registrationType === TRANSACTION_TYPES.BUY) {
    return (
      <div className="page center">
        <DialogModal
          showClose={false}
          cancelText="Manage"
          body={
            <span
              className="flex flex-column white center"
              style={{
                height: '100%',
              }}
            >
              This domain is permanently registered and its lease cannot be
              extended.
              <ARNSCard domain={name} />
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="page center">
      <div className="flex flex-column" style={{ maxWidth: '1000px' }}>
        <div
          className="flex flex-row center"
          style={{ justifyContent: 'space-between' }}
        >
          <h1 className="white">Extend Lease</h1>

          <div
            className="flex flex-row center white"
            style={{
              border: 'solid 1px var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              gap: '8px',
              width: 'fit-content',
              padding: '12px',
            }}
          >
            <InfoIcon width={'22px'} height={'22px'} fill="var(--text-grey)" />
            Expiring on{' '}
            {Intl.DateTimeFormat('en-US').format(record.endTimestamp * 1000)}
          </div>
        </div>
        <div
          className="flex flex-column"
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--card-bg)',
            borderRadius: 'var(--corner-radius)',
            padding: '30px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* maxxed out duration overlay */}
          {maxIncrease < 1 ? (
            <div
              className="flex flex-column center modal-container"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 'var(--corner-radius)',
                zIndex: 1,
              }}
            >
              <div
                className="flex flex-row center"
                style={{
                  width: 'fit-content',
                  height: 'fit-content',
                  borderRadius: 'var(--corner-radius)',
                  border: 'solid 1px var(--error-red)',
                  background: '#1D1314',
                  padding: '10px',
                  boxSizing: 'border-box',
                  color: 'var(--error-red)',
                  gap: '10px',
                }}
              >
                {' '}
                <InfoIcon
                  width={'24px'}
                  height={'24px'}
                  fill="var(--error-red)"
                />
                <span className="center">Maximum lease extension reached</span>
              </div>
            </div>
          ) : (
            <></>
          )}
          <Counter
            setValue={setNewLeaseDuration}
            value={newLeaseDuration}
            maxValue={maxIncrease}
            minValue={MIN_LEASE_DURATION}
            valueName={newLeaseDuration > 1 ? 'years' : 'year'}
            valueStyle={{ padding: '10px 80px' }}
            detail={
              <span>
                until{' '}
                {Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }).format(
                  record.endTimestamp * 1000 +
                    newLeaseDuration * YEAR_IN_MILLISECONDS,
                )}
              </span>
            }
            title={
              <span
                className="white"
                style={{ padding: '0px 10px 10px 10px', fontWeight: '500' }}
              >{`Registration period (between ${MIN_LEASE_DURATION}-${MAX_LEASE_DURATION} years)`}</span>
            }
          />
        </div>
        {/* TODO: [PE-4563] implement contract read api for extend record */}
        <TransactionCost
          fee={{
            [ioTicker]: ioFee,
          }}
          ioRequired={true}
        />
        <WorkflowButtons
          backText="Cancel"
          nextText="Continue"
          customNextStyle={{
            background: maxIncrease < 1 && 'var(--text-grey)',
            color: maxIncrease < 1 && 'var(--text-white)',
          }}
          onBack={() => {
            navigate(`/manage/names/${name}`);
          }}
          onNext={
            !ioFee || ioFee < 0
              ? undefined
              : maxIncrease >= 1 || ioFee <= ioBalance
              ? () => {
                  const payload: ExtendLeasePayload = {
                    name,
                    years: newLeaseDuration,
                    contractTxId: new ArweaveTransactionID(record.contractTxId),
                    qty: ioFee,
                  };

                  dispatchTransactionState({
                    type: 'setInteractionType',
                    payload: INTERACTION_TYPES.EXTEND_LEASE,
                  });
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      assetId: ARNS_REGISTRY_ADDRESS.toString(),
                      functionName: 'extendRecord',
                      ...payload,
                      interactionPrice: ioFee,
                    },
                  });
                  navigate('/transaction', {
                    state: `/manage/names/${name}/extend`,
                  });
                }
              : undefined
          }
          detail={
            ioFee && ioFee > ioBalance && maxIncrease > 0 ? (
              <div
                className="flex flex-row center"
                style={{
                  width: 'fit-content',
                  height: 'fit-content',
                  borderRadius: 'var(--corner-radius)',
                  border: 'solid 1px var(--error-red)',
                  background: '#1D1314',
                  padding: '8px',
                  boxSizing: 'border-box',
                  color: 'var(--error-red)',
                  gap: '10px',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                }}
              >
                {' '}
                <InfoIcon
                  width={'24px'}
                  height={'24px'}
                  fill="var(--error-red)"
                />
                <span className="center">Insufficient funds.</span>
              </div>
            ) : (
              <></>
            )
          }
        />
      </div>
    </div>
  );
}

export default ExtendLease;
