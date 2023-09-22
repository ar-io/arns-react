import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  ExtendLeasePayload,
  INTERACTION_TYPES,
  PDNSRecordEntry,
  TRANSACTION_TYPES,
} from '../../../types';
import {
  calculateAnnualRenewalFee,
  getLeaseDurationFromEndTimestamp,
  lowerCaseDomain,
} from '../../../utils';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  PDNS_REGISTRY_ADDRESS,
  YEAR_IN_MILLISECONDS,
  YEAR_IN_SECONDS,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { PDNSCard } from '../../cards';
import { InfoIcon } from '../../icons';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import DialogModal from '../../modals/DialogModal/DialogModal';
import TransactionCost from '../TransactionCost/TransactionCost';
import PageLoader from '../progress/PageLoader/PageLoader';

function ExtendLease() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsSourceContract, walletAddress }] = useGlobalState();
  const [, dispatchTransactionState] = useTransactionState();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.pathname.split('/').at(-2);
  const [record, setRecord] = useState<PDNSRecordEntry>();
  const [registrationType, setRegistrationType] = useState<TRANSACTION_TYPES>();
  const [newLeaseDuration, setNewLeaseDuration] = useState<number>(1);
  const [maxIncrease, setMaxIncrease] = useState<number>(0);
  const [ioFee, setIoFee] = useState<number>(0);
  const [ioBalance, setIoBalance] = useState<number>(0);

  useEffect(() => {
    if (!name) {
      navigate(-1);
      return;
    }
    onLoad(lowerCaseDomain(name));
  }, [name]);

  // TODO: use contract API to get fee
  useEffect(() => {
    if (!record || !record.endTimestamp || !name) {
      return;
    }

    setIoFee(
      calculateAnnualRenewalFee(
        lowerCaseDomain(name),
        pdnsSourceContract.fees,
        newLeaseDuration,
        record.undernames,
        record.endTimestamp + newLeaseDuration * YEAR_IN_SECONDS,
      ),
    );
  }, [newLeaseDuration, maxIncrease, record, name]);

  async function onLoad(domain: string) {
    try {
      const domainRecord = await arweaveDataProvider.getRecord(domain);
      if (!domainRecord?.type) {
        throw new Error(`Unable to get record for ${domain}`);
      }
      setRegistrationType(domainRecord.type);

      setRecord(domainRecord);

      if (!domainRecord.endTimestamp) {
        setRegistrationType(TRANSACTION_TYPES.BUY);
        return;
      }
      const balance = await arweaveDataProvider.getIoBalance(walletAddress!);

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

      const newFee = calculateAnnualRenewalFee(
        lowerCaseDomain(domain),
        pdnsSourceContract.fees,
        newLeaseDuration,
        domainRecord.undernames,
        domainRecord.endTimestamp + newLeaseDuration * YEAR_IN_SECONDS,
      );
      setIoFee(newFee);
    } catch (error) {
      eventEmitter.emit('error', error);
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
              <PDNSCard domain={name} />
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
                style={{ padding: '10px', fontWeight: '500' }}
              >{`Registration period (between ${MIN_LEASE_DURATION}-${MAX_LEASE_DURATION} years)`}</span>
            }
          />
        </div>
        {/* TODO: [PE-4563] implement contract read api for extend record */}
        <TransactionCost
          fee={{
            io: ioFee,
          }}
        />
        <WorkflowButtons
          backText="Cancel"
          nextText="Continue"
          customNextStyle={{
            background: maxIncrease < 1 && 'var(--text-grey)',
            color: maxIncrease < 1 && 'var(--text-white)',
          }}
          onBack={() => navigate(-1)}
          onNext={
            maxIncrease >= 1 || ioFee <= ioBalance
              ? () => {
                  const payload: ExtendLeasePayload = {
                    name,
                    years: newLeaseDuration,
                    contractTxId: new ArweaveTransactionID(record.contractTxId),
                    ioFee,
                  };

                  dispatchTransactionState({
                    type: 'setInteractionType',
                    payload: INTERACTION_TYPES.EXTEND_LEASE,
                  });
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      assetId: PDNS_REGISTRY_ADDRESS,
                      functionName: 'extendRecord',
                      ...payload,
                    },
                  });
                  navigate('/transaction', {
                    state: `/manage/names/${name}/extend`,
                  });
                }
              : undefined
          }
          detail={
            ioFee > ioBalance && maxIncrease > 0 ? (
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
