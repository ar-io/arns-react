import { AoArNSNameData, isLeasedArNSRecord, mIOToken } from '@ar.io/sdk/web';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  ARNS_INTERACTION_TYPES,
  ExtendLeasePayload,
  TRANSACTION_TYPES,
} from '../../../types';
import {
  formatDate,
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
  const [{ ioTicker, arioContract }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [, dispatchTransactionState] = useTransactionState();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.pathname.split('/').at(-2);
  const [record, setRecord] = useState<AoArNSNameData>();
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
    if (!record || !name || !isLeasedArNSRecord(record)) {
      return;
    }

    setIoFee(undefined);
    const updateIoFee = async () => {
      const price = await arioContract
        .getTokenCost({
          intent: 'Extend-Lease',
          name: name,
          years: newLeaseDuration,
        })
        .then((p) => new mIOToken(p).toIO().valueOf());
      setIoFee(price);
    };
    updateIoFee();
  }, [newLeaseDuration, maxIncrease, record, name]);

  async function onLoad(domain: string) {
    try {
      // TODO: make this generic so we get back the correct type

      const domainRecord = await arioContract.getArNSRecord({
        name: domain,
      });
      if (!domainRecord) {
        throw new Error(`Unable to get record for ${domain}`);
      }
      setRegistrationType(domainRecord.type as TRANSACTION_TYPES);
      setRecord(domainRecord);

      if (!isLeasedArNSRecord(domainRecord)) {
        setRegistrationType(TRANSACTION_TYPES.BUY);
        return;
      }

      if (!walletAddress) {
        // TODO: navigate to connect
        throw new Error('Wallet address not found');
      }

      const balance = await arioContract.getBalance({
        address: walletAddress.toString(),
      });
      setIoBalance(balance ?? 0);

      setMaxIncrease(
        Math.max(
          0,
          MAX_LEASE_DURATION -
            getLeaseDurationFromEndTimestamp(
              domainRecord.startTimestamp,
              domainRecord.endTimestamp,
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

  if (
    !isLeasedArNSRecord(record) ||
    registrationType === TRANSACTION_TYPES.BUY
  ) {
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
              <ARNSCard
                processId={new ArweaveTransactionID(record.processId)}
                domain={name}
              />
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
            Expiring on {formatDate(record.endTimestamp)}
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
                {formatDate(
                  record.endTimestamp + newLeaseDuration * YEAR_IN_MILLISECONDS,
                )}
              </span>
            }
            title={
              <span
                className="white"
                style={{ padding: '0px 10px 10px 10px', fontWeight: '500' }}
              >{`Extension Duration ( up to ${Math.max(1, maxIncrease)} year${
                maxIncrease > 1 ? 's' : ''
              } )`}</span>
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
                    processId: new ArweaveTransactionID(record.processId),
                    qty: ioFee,
                  };

                  dispatchTransactionState({
                    type: 'setInteractionType',
                    payload: ARNS_INTERACTION_TYPES.EXTEND_LEASE,
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
                  dispatchTransactionState({
                    type: 'setWorkflowName',
                    payload: ARNS_INTERACTION_TYPES.EXTEND_LEASE,
                  });
                  navigate('/transaction/review', {
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
