import { AoArNSNameData, isLeasedArNSRecord, mARIOToken } from '@ar.io/sdk/web';
import { useTokenCost } from '@src/hooks/useTokenCost';
import Lottie from 'lottie-react';
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
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
  YEAR_IN_MILLISECONDS,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { InfoIcon } from '../../icons';
import arioLoading from '../../icons/ario-spinner.json';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import DialogModal from '../../modals/DialogModal/DialogModal';
import TransactionCost from '../TransactionCost/TransactionCost';
import PageLoader from '../progress/PageLoader/PageLoader';

function ExtendLease() {
  // TODO: remove use of source contract
  const [{ arioTicker, arioContract, arioProcessId }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [, dispatchTransactionState] = useTransactionState();
  const location = useLocation();
  const navigate = useNavigate();
  const name = location.pathname.split('/').at(-2);
  const [record, setRecord] = useState<AoArNSNameData>();
  const [registrationType, setRegistrationType] = useState<TRANSACTION_TYPES>();
  const [newLeaseDuration, setNewLeaseDuration] = useState<number>(1);
  const [maxIncrease, setMaxIncrease] = useState<number>(0);
  const [ioBalance, setIoBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: ioFee } = useTokenCost(
    registrationType === 'permabuy'
      ? {
          intent: 'Upgrade-Name',
          name: name as string,
        }
      : {
          intent: 'Extend-Lease',
          years: newLeaseDuration,
          type: registrationType?.toString() as any,
          name: name as string,
        },
  );

  useEffect(() => {
    if (!name) {
      navigate(`/manage/names`);
      return;
    }
    onLoad(lowerCaseDomain(name));
  }, [name]);

  async function onLoad(domain: string) {
    try {
      setLoading(true);
      // TODO: make this generic so we get back the correct type

      const domainRecord = await arioContract.getArNSRecord({
        name: lowerCaseDomain(domain),
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

      if (walletAddress) {
        const balance = await arioContract.getBalance({
          address: walletAddress.toString(),
        });
        setIoBalance(balance ?? 0);
      }

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
    } finally {
      setLoading(false);
    }
  }

  if (!record || !name) {
    return (
      <PageLoader loading={!record} message={`Loading info for ${name}`} />
    );
  }

  if (!isLeasedArNSRecord(record)) {
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
          <h1 className="white text-[2rem]">Extend Lease</h1>

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
        </div>{' '}
        <div
          className="flex flex-row flex-space-between"
          style={{ gap: '25px' }}
        >
          <button
            className="flex flex-row center text-medium bold pointer"
            onClick={() => setRegistrationType(TRANSACTION_TYPES.LEASE)}
            style={{
              position: 'relative',
              background:
                registrationType === TRANSACTION_TYPES.LEASE
                  ? 'var(--text-white)'
                  : '',
              color:
                registrationType === TRANSACTION_TYPES.LEASE
                  ? 'var(--text-black)'
                  : 'var(--text-white)',
              border: 'solid 2px var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              height: '56px',
              borderBottomWidth: '0.5px',
            }}
          >
            Extend Lease{' '}
            {registrationType === TRANSACTION_TYPES.LEASE ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'rotate(45deg)',
                  width: '11px',
                  height: '11px',
                  background: 'var(--text-white)',
                }}
              ></div>
            ) : (
              <></>
            )}
          </button>
          <button
            className="flex flex-row center text-medium bold pointer"
            style={{
              position: 'relative',
              background:
                registrationType === TRANSACTION_TYPES.BUY
                  ? 'var(--text-white)'
                  : '',
              color:
                registrationType === TRANSACTION_TYPES.BUY
                  ? 'var(--text-black)'
                  : 'var(--text-white)',
              border: 'solid 2px var(--text-faded)',
              borderRadius: 'var(--corner-radius)',
              height: '56px',
              borderBottomWidth: '0.5px',
            }}
            onClick={() => setRegistrationType(TRANSACTION_TYPES.BUY)}
          >
            Permanently Buy{' '}
            {registrationType === TRANSACTION_TYPES.BUY ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'rotate(45deg)',
                  width: '11px',
                  height: '11px',
                  background: 'var(--text-white)',
                }}
              ></div>
            ) : (
              <></>
            )}
          </button>
        </div>
        <div className="flex flex-col relative p-[30px] w-full h-[200px] bg-foreground box-border rounded-md items-center justify-center ">
          {registrationType === TRANSACTION_TYPES.LEASE ? (
            <>
              {' '}
              {/* loading overlay */}
              {loading && (
                <div className="flex flex-col items-center justify-center rounded-md bg-foreground h-full w-full absolute top-0 left-0">
                  <div className="flex flex-row items-center justify-center">
                    <Lottie
                      animationData={arioLoading}
                      loop={true}
                      className="h-[150px]"
                    />
                  </div>
                </div>
              )}
              {/* maxxed out duration overlay */}
              {!loading && maxIncrease < 1 && (
                <div className="flex flex-col center  rounded-md  bg-[rgb(0,0,0,0.5)] h-full w-full absolute top-0 left-0">
                  <div className="flex flex-row items-center justify-center max-w-fit h-fit rounded-md border border-error text-white bg-foreground p-6 gap-2">
                    {' '}
                    <InfoIcon
                      width={'24px'}
                      height={'24px'}
                      fill="var(--error-red)"
                    />
                    <span className="center">
                      Maximum lease extension reached
                    </span>
                  </div>
                </div>
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
                      record.endTimestamp +
                        newLeaseDuration * YEAR_IN_MILLISECONDS,
                    )}
                  </span>
                }
                title={
                  <span
                    className="white"
                    style={{ padding: '0px 10px 10px 10px', fontWeight: '500' }}
                  >{`Extension Duration ( up to ${Math.max(
                    1,
                    maxIncrease,
                  )} year${maxIncrease > 1 ? 's' : ''} )`}</span>
                }
              />
            </>
          ) : (
            <div
              className="flex flex-column flex-center"
              style={{ gap: '1em' }}
            >
              <span className="text-medium grey center">
                Registration Period
              </span>
              <span className="text-medium white center">Permanent</span>
            </div>
          )}
        </div>
        {/* TODO: [PE-4563] implement contract read api for extend record */}
        <TransactionCost
          feeWrapperStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
          fee={{
            [arioTicker]: ioFee
              ? new mARIOToken(ioFee).toARIO().valueOf()
              : undefined,
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
            navigate(`/manage/names/${lowerCaseDomain(name)}`);
          }}
          onNext={
            !ioFee || ioFee < 0
              ? undefined
              : maxIncrease >= 1 || ioFee <= ioBalance
              ? () => {
                  if (registrationType === TRANSACTION_TYPES.LEASE) {
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
                      type: 'setWorkflowName',
                      payload: ARNS_INTERACTION_TYPES.EXTEND_LEASE,
                    });
                    dispatchTransactionState({
                      type: 'setTransactionData',
                      payload: {
                        assetId: arioProcessId,
                        functionName: 'extendRecord',
                        ...payload,
                        arnsRecord: record,
                        interactionPrice: new mARIOToken(ioFee)
                          .toARIO()
                          .valueOf(),
                      },
                    });
                  } else {
                    dispatchTransactionState({
                      type: 'setInteractionType',
                      payload: ARNS_INTERACTION_TYPES.UPGRADE_NAME,
                    });
                    dispatchTransactionState({
                      type: 'setWorkflowName',
                      payload: ARNS_INTERACTION_TYPES.UPGRADE_NAME,
                    });
                    dispatchTransactionState({
                      type: 'setTransactionData',
                      payload: {
                        assetId: arioProcessId,
                        functionName: 'upgradeName',
                        name,
                        processId: new ArweaveTransactionID(record.processId),
                        qty: ioFee,
                        arnsRecord: record,
                        interactionPrice: new mARIOToken(ioFee)
                          .toARIO()
                          .valueOf(),
                      },
                    });
                  }

                  navigate('/transaction/review', {
                    state: `/manage/names/${lowerCaseDomain(name)}/extend`,
                  });
                }
              : undefined
          }
          detail={
            ioFee &&
            new mARIOToken(ioFee).toARIO().valueOf() >= ioBalance &&
            maxIncrease > 0 ? (
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
