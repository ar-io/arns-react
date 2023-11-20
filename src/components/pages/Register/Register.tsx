import { CheckCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import emojiRegex from 'emoji-regex';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  useAuctionInfo,
  useIsFocused,
  useRegistrationStatus,
} from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  BuyRecordPayload,
  INTERACTION_NAMES,
  INTERACTION_TYPES,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  encodeDomainToASCII,
  lowerCaseDomain,
  userHasSufficientBalance,
} from '../../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  ATOMIC_FLAG,
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { LockIcon } from '../../icons';
import Counter from '../../inputs/Counter/Counter';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import NameTokenSelector from '../../inputs/text/NameTokenSelector/NameTokenSelector';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import Loader from '../../layout/Loader/Loader';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import { StepProgressBar } from '../../layout/progress';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function RegisterNameForm() {
  const [
    { domain, fee, leaseDuration, registrationType, antID },
    dispatchRegisterState,
  ] = useRegistrationState();
  const [{ blockHeight, arweaveDataProvider, ioTicker }, dispatchGlobalState] =
    useGlobalState();
  const [{ walletAddress, balances }] = useWalletState();
  const [, dispatchTransactionState] = useTransactionState();
  const { name } = useParams();
  const { auction, loadingAuctionInfo } = useAuctionInfo(
    lowerCaseDomain(name ?? domain),
    registrationType,
  );
  const { loading: isValidatingRegistration } = useRegistrationStatus(
    name ?? domain,
  );
  const [targetId, setTargetId] = useState<string>();
  const targetIdFocused = useIsFocused('target-id-input');
  const navigate = useNavigate();
  const [hasValidationErrors, setHasValidationErrors] =
    useState<boolean>(false);
  const ioFee = fee?.[ioTicker];
  const feeError = ioFee && ioFee < 0;

  useEffect(() => {
    if (!blockHeight) {
      arweaveDataProvider.getCurrentBlockHeight().then((height) => {
        dispatchGlobalState({
          type: 'setBlockHeight',
          payload: height,
        });
      });
    }
    if (!loadingAuctionInfo && auction) {
      dispatchRegisterState({
        type: 'setRegistrationType',
        payload: auction.type,
      });
    }
  }, [loadingAuctionInfo, domain]);

  useEffect(() => {
    if (name && domain !== name) {
      dispatchRegisterState({
        type: 'setDomainName',
        payload: name,
      });
    }
    if (
      auction &&
      (auction.isRequiredToBeAuctioned || auction.isActive) &&
      domain &&
      blockHeight
    ) {
      dispatchRegisterState({
        type: 'setFee',
        payload: { ar: fee.ar, [ioTicker]: auction.currentPrice },
      });
    } else {
      if (!auction) {
        return;
      }
      const update = async () => {
        if (domain) {
          try {
            dispatchRegisterState({
              type: 'setFee',
              payload: { ar: fee.ar, [ioTicker]: undefined },
            });
            const price = await arweaveDataProvider
              .getPriceForInteraction({
                interactionName: INTERACTION_NAMES.BUY_RECORD,
                payload: {
                  name: domain,
                  years: leaseDuration,
                  type: auction.type,
                  contractTxId: ATOMIC_FLAG,
                },
              })
              .catch(() => {
                throw new Error('Unable to get purchase price for domain');
              });
            dispatchRegisterState({
              type: 'setFee',
              payload: { ar: fee.ar, [ioTicker]: price },
            });
          } catch (e) {
            eventEmitter.emit('error', e);
          }
        }
      };
      update();
    }
  }, [leaseDuration, domain, auction]);

  async function handlePDNTId(id: string) {
    try {
      const txId = new ArweaveTransactionID(id.toString());
      dispatchRegisterState({
        type: 'setANTID',
        payload: txId,
      });

      const contract = await arweaveDataProvider.buildANTContract(txId);

      if (!contract.isValid()) {
        throw Error('ANT contract state does not match required schema.');
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  if (!walletAddress || !registrationType) {
    return <Loader size={80} />;
  }

  async function handleNext() {
    if (fee?.[ioTicker] === undefined) {
      return;
    }
    try {
      // validate transaction cost, return if insufficient balance and emit validation message
      userHasSufficientBalance<{
        [x: string]: number;
        AR: number;
      }>({
        balances: { AR: balances.ar, ...balances },
        costs: { AR: fee.ar, ...fee } as { [x: string]: number; AR: number },
      });
    } catch (error: any) {
      eventEmitter.emit('error', {
        name: 'Insufficient funds',
        message: error.message,
      });

      return;
    }

    const leaseDurationType = auction?.isRequiredToBeAuctioned
      ? 1
      : leaseDuration;
    const buyRecordPayload: BuyRecordPayload = {
      name:
        domain && emojiRegex().test(domain)
          ? encodeDomainToASCII(domain)
          : domain,
      contractTxId: antID ? antID.toString() : ATOMIC_FLAG,
      // TODO: move this to a helper function
      years:
        registrationType === TRANSACTION_TYPES.LEASE
          ? leaseDurationType
          : undefined,
      type: registrationType,
      auction: (auction?.isRequiredToBeAuctioned || auction?.isActive) ?? false,
      isBid: auction?.isActive ?? false,
      targetId: targetId ? new ArweaveTransactionID(targetId) : undefined,
    };

    dispatchTransactionState({
      type: 'setTransactionData',
      payload: {
        assetId: ARNS_REGISTRY_ADDRESS.toString(),
        functionName: 'buyRecord',
        ...buyRecordPayload,
        interactionPrice: fee?.[ioTicker],
      },
    });
    dispatchTransactionState({
      type: 'setInteractionType',
      payload: INTERACTION_TYPES.BUY_RECORD,
    });
    // navigate to the transaction page, which will load the updated state of the transaction context
    navigate('/transaction', {
      state: `/register/${domain}`,
    });
    dispatchRegisterState({
      type: 'reset',
    });
  }

  return (
    <div className="page center">
      <PageLoader
        message={'Loading Domain info, please wait.'}
        loading={loadingAuctionInfo || isValidatingRegistration}
      />
      <div
        className="flex flex-column flex-center"
        style={{
          maxWidth: '900px',
          width: '100%',
          padding: '0px',
          margin: '50px',
          gap: '80px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="flex flex-row flex-center"
          style={{
            paddingBottom: '40px',
            borderBottom: 'solid 1px var(--text-faded)',
          }}
        >
          <StepProgressBar
            stages={[
              { title: 'Choose', description: 'Pick a name', status: 'finish' },
              {
                title: 'Configure',
                description: 'Registration Period',
                status: 'process',
              },
              {
                title: 'Confirm',
                description: 'Review transaction',
                status: 'wait',
              },
            ]}
            stage={1}
          />
        </div>

        <span
          className="text-medium white center"
          style={{ fontWeight: '500px', fontSize: '23px', gap: '15px' }}
        >
          <span style={{ color: 'var(--success-green)' }}>
            {domain} <span className={'white'}>is available!</span>
          </span>{' '}
          <CheckCircleFilled
            style={{ fontSize: '20px', color: 'var(--success-green)' }}
          />
        </span>
        <div className="flex flex-column flex-center">
          <div
            className="flex flex-column flex-center"
            style={{
              width: '100%',
              height: 'fit-content',
              gap: '25px',
            }}
          >
            <div
              className="flex flex-row flex-space-between"
              style={{ gap: '25px' }}
            >
              <button
                className="flex flex-row center text-medium bold pointer"
                // TODO: add a tool tip explaining why when it is an active auction you cannot change the type
                disabled={
                  auction?.isActive &&
                  registrationType === TRANSACTION_TYPES.BUY
                }
                onClick={() =>
                  dispatchRegisterState({
                    type: 'setRegistrationType',
                    payload: TRANSACTION_TYPES.LEASE,
                  })
                }
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
                Lease{' '}
                {(registrationType === TRANSACTION_TYPES.LEASE ||
                  auction?.type === TRANSACTION_TYPES.LEASE) &&
                auction?.isActive ? (
                  <LockIcon
                    width={'20px'}
                    height={'20px'}
                    fill={'var(--text-black)'}
                    style={{ position: 'absolute', right: '20px' }}
                  />
                ) : (
                  <></>
                )}
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
                // TODO: add a tool tip explaining why when it is an active auction you cannot change the type
                disabled={
                  auction?.isActive &&
                  registrationType === TRANSACTION_TYPES.LEASE
                }
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
                onClick={() =>
                  dispatchRegisterState({
                    type: 'setRegistrationType',
                    payload: TRANSACTION_TYPES.BUY,
                  })
                }
              >
                Buy{' '}
                {(registrationType === TRANSACTION_TYPES.BUY ||
                  auction?.type === TRANSACTION_TYPES.BUY) &&
                auction?.isActive ? (
                  <LockIcon
                    width={'20px'}
                    height={'20px'}
                    fill={'var(--text-black)'}
                    style={{ position: 'absolute', right: '20px' }}
                  />
                ) : (
                  <></>
                )}
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

            <div
              className="flex flex-column flex-center card"
              style={{
                width: '100%',
                minHeight: '0px',
                height: 'fit-content',
                maxWidth: 'unset',
                padding: '35px',
                boxSizing: 'border-box',
                borderTopWidth: '0.2px',
                borderRadius: 'var(--corner-radius)',
                justifyContent: 'flex-start',
              }}
            >
              {registrationType === TRANSACTION_TYPES.LEASE ? (
                <Counter
                  value={leaseDuration}
                  setValue={(v: number) => {
                    dispatchRegisterState({
                      type: 'setLeaseDuration',
                      payload: v,
                    });
                  }}
                  // TODO: move this to a helper function
                  minValue={
                    auction?.isActive || auction?.isRequiredToBeAuctioned
                      ? 1
                      : MIN_LEASE_DURATION
                  }
                  maxValue={
                    auction?.isActive || auction?.isRequiredToBeAuctioned
                      ? 1
                      : MAX_LEASE_DURATION
                  }
                  valueStyle={{ padding: '20px 120px' }}
                  valueName={leaseDuration > 1 ? 'years' : 'year'}
                  detail={`Until ${Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(
                    Date.now() + leaseDuration * 365 * 24 * 60 * 60 * 1000,
                  )}`}
                  title={
                    <span
                      className="white"
                      style={{
                        padding: '0px 10px 10px 10px',
                        fontWeight: '500',
                      }}
                    >{`Registration period (between ${MIN_LEASE_DURATION}-${MAX_LEASE_DURATION} years)`}</span>
                  }
                />
              ) : registrationType === TRANSACTION_TYPES.BUY ? (
                <div
                  className="flex flex-column flex-center"
                  style={{ gap: '1em' }}
                >
                  <span className="text-medium grey center">
                    Registration Period
                  </span>
                  <span className="text-medium white center">Permanent</span>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-column" style={{ gap: '1em' }}>
            <NameTokenSelector
              selectedTokenCallback={(id) =>
                id
                  ? handlePDNTId(id.toString())
                  : dispatchRegisterState({
                      type: 'setANTID',
                      payload: undefined,
                    })
              }
            />
            <div
              className="name-token-input-wrapper"
              style={{
                border:
                  targetIdFocused || targetId
                    ? 'solid 1px var(--text-white)'
                    : 'solid 1px var(--text-faded)',
                position: 'relative',
              }}
            >
              <ValidationInput
                inputId={'target-id-input'}
                value={targetId ?? ''}
                setValue={(v: string) => {
                  setTargetId(v.trim());
                  if (v.trim().length === 0) {
                    setHasValidationErrors(false);
                  }
                }}
                wrapperCustomStyle={{
                  width: '100%',
                  hieght: '45px',
                  borderRadius: '0px',
                  backgroundColor: 'var(--card-bg)',
                  boxSizing: 'border-box',
                }}
                inputClassName={`white name-token-input`}
                inputCustomStyle={{
                  paddingLeft: '10px',
                  background: 'transparent',
                }}
                maxCharLength={43}
                placeholder={'Arweave Transaction ID'}
                validationPredicates={{
                  [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                    fn: (id: string) =>
                      arweaveDataProvider.validateArweaveId(id),
                  },
                }}
                showValidationChecklist={false}
                showValidationIcon={true}
                validityCallback={(validity: boolean) => {
                  setHasValidationErrors(!validity);
                }}
              />
              <span className="grey pointer hover" style={{ fontSize: '12px' }}>
                <Tooltip
                  placement={'right'}
                  autoAdjustOverflow={true}
                  arrow={false}
                  overlayInnerStyle={{
                    width: '190px',
                    color: 'var(--text-black)',
                    textAlign: 'center',
                    fontFamily: 'Rubik-Bold',
                    fontSize: '14px',
                    backgroundColor: 'var(--text-white)',
                    padding: '15px',
                  }}
                  title={
                    'The Target ID is the arweave ID that will be resolved by the ArNS name.'
                  }
                >
                  Optional
                </Tooltip>
              </span>
            </div>
            <TransactionCost
              ioRequired={true}
              fee={fee}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
            />
            {domain &&
            auction &&
            auction.isRequiredToBeAuctioned &&
            fee?.[ioTicker] ? (
              <div
                className="flex flex-row warning-container"
                style={{
                  gap: '1em',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}
              >
                <span
                  className="flex flex-column"
                  style={{ textAlign: 'left', fontSize: '13px', gap: '1em' }}
                >
                  Buying this name involves a Dutch auction. You start by
                  bidding at the floor price of{' '}
                  {fee?.[ioTicker]?.toLocaleString()} {ioTicker}. The
                  name&apos;s price begins at 10 times your bid and decreases
                  over 2 weeks until it matches your bid, securing your win. You
                  can also buy instantly at the ongoing price throughout the
                  auction; if someone else does, you will lose the auction and
                  have your initial bid returned.
                  <Link
                    to="https://ar.io/docs/arns/#bid-initiated-dutch-auctions-bida"
                    rel="noreferrer"
                    target="_blank"
                    className="link"
                    style={{ textDecoration: 'underline', color: 'inherit' }}
                  >
                    Learn more.
                  </Link>
                </span>
              </div>
            ) : (
              <></>
            )}{' '}
            <div style={{ marginTop: '30px' }}>
              <WorkflowButtons
                nextText="Next"
                backText="Back"
                onNext={
                  hasValidationErrors || feeError ? undefined : handleNext
                }
                onBack={() => navigate('/', { state: `/register/${domain}` })}
                customNextStyle={{ width: '100px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterNameForm;
