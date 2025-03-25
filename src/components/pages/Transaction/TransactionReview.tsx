import { CheckCircleFilled } from '@ant-design/icons';
import {
  ARIOWriteable,
  AoARIOWrite,
  FundFrom,
  mARIOToken,
} from '@ar.io/sdk/web';
import { Accordion, Tooltip } from '@src/components/data-display';
import { TransactionDetails } from '@src/components/data-display/TransactionDetails/TransactionDetails';
import { ArIOTokenIcon, TurboIcon } from '@src/components/icons';
import Counter from '@src/components/inputs/Counter/Counter';
import WorkflowButtons from '@src/components/inputs/buttons/WorkflowButtons/WorkflowButtons';
import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { useIsMobile } from '@src/hooks';
import {
  useArIOLiquidBalance,
  useArIOStakedAndVaultedBalance,
} from '@src/hooks/useArIOBalance';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { dispatchArNSUpdate, useArNSState } from '@src/state';
import dispatchArIOInteraction from '@src/state/actions/dispatchArIOInteraction';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import {
  ARNS_INTERACTION_TYPES,
  ArNSInteractionTypeToIntentMap,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '@src/types';
import {
  formatARIOWithCommas,
  formatDate,
  isArweaveTransactionID,
} from '@src/utils';
import { MAX_LEASE_DURATION, MIN_LEASE_DURATION } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Circle, CircleCheck, CreditCard } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// page on route transaction/review
// on completion routes to transaction/complete
function TransactionReview() {
  const navigate = useNavigate();
  const [{ arioContract, arioProcessId, aoNetwork, aoClient }] =
    useGlobalState();
  const [, dispatchArNSState] = useArNSState();
  const [{ walletAddress, wallet }] = useWalletState();
  const [
    { workflowName, interactionType, transactionData, interactionResult },
    dispatchTransactionState,
  ] = useTransactionState();
  const isMobile = useIsMobile();

  const { data: liquidBalance } = useArIOLiquidBalance();
  const { data: stakedAndVaultedBalance } = useArIOStakedAndVaultedBalance();

  const liquidArIOBalance = useMemo(() => {
    return liquidBalance ? new mARIOToken(liquidBalance).toARIO().valueOf() : 0;
  }, [liquidBalance]);
  const stakedAndVaultedArIOBalance = useMemo(() => {
    return stakedAndVaultedBalance
      ? new mARIOToken(stakedAndVaultedBalance.totalDelegatedStake)
          .toARIO()
          .valueOf() +
          new mARIOToken(stakedAndVaultedBalance.totalVaultedStake)
            .toARIO()
            .valueOf()
      : 0;
  }, [stakedAndVaultedBalance]);
  const allArIOBalance = useMemo(() => {
    return liquidArIOBalance + stakedAndVaultedArIOBalance;
  }, [liquidArIOBalance, stakedAndVaultedArIOBalance]);

  const [fundingSource, setFundingSource] = useState<FundFrom | undefined>(
    'balance',
  );

  const [registrationType, setRegistrationType] = useState<
    TRANSACTION_TYPES | undefined
  >(TRANSACTION_TYPES.LEASE);

  const [leaseDuration, setLeaseDuration] =
    useState<number>(MIN_LEASE_DURATION);

  const [newTargetId, setNewTargetId] = useState<string | undefined>(undefined);

  const costDetailsParams = {
    ...((transactionData ?? {}) as any),
    intent:
      ArNSInteractionTypeToIntentMap[workflowName as ARNS_INTERACTION_TYPES],
    fromAddress: walletAddress?.toString(),
    fundFrom: fundingSource,
    quantity: (transactionData as any)?.qty,
  };
  const { data: costDetail } = useCostDetails(costDetailsParams);

  useEffect(() => {
    if (!transactionData && !workflowName) {
      navigate('/');
      return;
    }
  }, [
    transactionData,
    interactionResult,
    workflowName,
    interactionType,
    walletAddress,
  ]);

  useEffect(() => {
    if (interactionResult?.id) {
      navigate('/transaction/complete');
    }
  }, [interactionResult, navigate]);

  async function handleNext() {
    try {
      if (!(arioContract instanceof ARIOWriteable)) {
        throw new Error('Wallet must be connected to dispatch transactions.');
      }
      if (!transactionData || !workflowName) {
        throw new Error('Transaction data is missing');
      }

      if (!walletAddress) {
        throw new Error('Wallet address is missing');
      }
      // TODO: check that it's connected
      await dispatchArIOInteraction({
        arioContract: arioContract as AoARIOWrite,
        workflowName: workflowName as ARNS_INTERACTION_TYPES,
        payload: transactionData,
        owner: walletAddress,
        processId: arioProcessId,
        dispatch: dispatchTransactionState,
        signer: wallet?.contractSigner,
        ao: aoClient,
        scheduler: aoNetwork.ARIO.SCHEDULER,
        fundFrom: fundingSource,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      if (walletAddress) {
        dispatchArNSUpdate({
          dispatch: dispatchArNSState,
          arioProcessId,
          walletAddress,
          aoNetworkSettings: aoNetwork,
        });
      }
    }
  }

  return (
    <div className="page">
      <div
        className="flex flex-column center"
        style={isMobile ? {} : { gap: '0px', maxWidth: '', width: '100%' }}
      >
        {/* {steps && steps.length ? (
          <div
            className="flex flex-row"
            style={{
              marginBottom: '20px',
              width: '100%',
            }}
          >
            <StepProgressBar stage={3} stages={steps} />
          </div>
        ) : (
          <></>
        )} */}

        {/* {typeof header === 'string' ? (
          <div
            className="flex flex-row text-large white bold center"
            style={{
              height: '100%',
              padding: '50px 0px',
              borderTop: steps?.length ? 'solid 1px var(--text-faded)' : '',
            }}
          >
            {header}
          </div>
        ) : (
          header
        )} */}

        <div className="flex gap-6 w-full h-full">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col border border-dark-grey rounded items-start w-full h-full ">
              <span className="flex text-white items-center justify-center gap-2 py-4 w-full text-2xl">
                <span style={{ color: 'var(--success-green)' }}>
                  lpb <span className={'white'}>is available!</span>
                </span>{' '}
                <CheckCircleFilled
                  style={{ fontSize: '20px', color: 'var(--success-green)' }}
                />
              </span>
              {Object.entries({
                // Domain: 'lpb',
                //'Lease Duration': '2 year',
                Undernames: 'Up to 10',
                TTL: '3600',
                'Process ID': '123',
                Nickname: 'lpb',
                Ticker: 'LPB',
              }).map(([k, v], i) => (
                <div
                  className="flex w-full p-3 border-t border-dark-grey flex-nowrap justify-start items-center text-grey gap-2"
                  key={i}
                >
                  <span className="flex w-1/4  justify-start items-start text-sm whitespace-nowrap">
                    {k}
                  </span>
                  <span className="flex w-full justify-start items-center text-white text-sm whitespace-nowrap">
                    {v}
                  </span>
                </div>
              ))}
              <div className="flex flex-column" style={{ gap: '1em' }}>
                <Accordion
                  title={<span className="text-medium">Advanced Options</span>}
                  key="1"
                >
                  <div className="flex flex-column" style={{ gap: '1em' }}>
                    <div
                      className="name-token-input-wrapper"
                      style={{
                        border: 'solid 1px var(--text-faded)',
                        position: 'relative',
                      }}
                    >
                      <ValidationInput
                        inputId={'target-id-input'}
                        value={newTargetId ?? ''}
                        setValue={(v: string) => {
                          setNewTargetId(v.trim());
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
                        placeholder={'Arweave Transaction ID (Target ID)'}
                        validationPredicates={{
                          [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                            fn: (id: string) => {
                              if (!isArweaveTransactionID(id)) {
                                return Promise.reject(
                                  new Error('Invalid Arweave Transaction ID'),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        }}
                        showValidationChecklist={false}
                        showValidationIcon={true}
                      />

                      <span
                        className="flex flex-row text grey flex-center"
                        style={{
                          width: 'fit-content',
                          height: 'fit-content',
                          wordBreak: 'keep-all',
                          // padding: '1px',
                        }}
                      >
                        <Tooltip message="The Target ID is the Arweave Transaction ID that will be resolved at the root of this ArNS name" />
                      </span>
                    </div>
                  </div>
                </Accordion>
              </div>
              {/* <ANTCard
              {...antProps}
              bordered
              compact={false}
              overrides={{
                ...antProps.overrides,
                targetId: (transactionData as any)?.targetId?.toString(),
                'Process ID': '123',
                Owner: '123',
                'Controller(s)': ['d'],
              }}
            /> */}
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            <div
              className="flex flex-col flex-center"
              style={{
                width: '100%',
                height: 'fit-content',
                gap: '15px',
              }}
            >
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
                  Lease{' '}
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
                  Buy{' '}
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
                  padding: '25px',
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
                      setLeaseDuration(v);
                    }}
                    // TODO: move this to a helper function
                    minValue={MIN_LEASE_DURATION}
                    maxValue={MAX_LEASE_DURATION}
                    valueStyle={{ padding: '20px 120px' }}
                    valueName={leaseDuration > 1 ? 'years' : 'year'}
                    detail={`Until ${formatDate(
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
            {/* tabs */}
            <Tabs.Root
              className="w-full text-white flex flex-col h-full"
              defaultValue="crypto"
            >
              <Tabs.List
                defaultValue={'crypto'}
                className="flex w-full justify-center items-center gap-2 mb-6"
              >
                <Tabs.Trigger
                  value="card"
                  className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-transparent data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap"
                >
                  <CreditCard className="size-5 text-grey" />
                  Credit Card
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="crypto"
                  className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-transparent data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap"
                >
                  <ArIOTokenIcon className="size-5 text-grey fill-grey rounded-full border border-grey" />{' '}
                  Crypto
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="credits"
                  className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-transparent data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap"
                >
                  <TurboIcon
                    className="size-5 text-grey"
                    stroke="var(--text-grey)"
                  />{' '}
                  Credits
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content
                value="card"
                className={`flex flex-col data-[state=active]:p-4 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0`}
              >
                <span className="text-grey flex m-auto">Coming Soon!</span>
              </Tabs.Content>
              <Tabs.Content
                value="crypto"
                className={`flex flex-col data-[state=active]:p-4 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0`}
              >
                <div className="flex flex-col gap-2 w-full items-start">
                  <span className="text-grey text-sm">
                    Select balance method
                  </span>
                  <Tabs.Root
                    defaultValue={fundingSource}
                    className="flex flex-col w-full h-full"
                  >
                    {' '}
                    <Tabs.List
                      className="flex flex-col w-full gap-2 text-white text-sm"
                      defaultValue={'balance'}
                    >
                      <Tabs.Trigger
                        value="balance"
                        className="flex w-full gap-2 p-3 rounded bg-foreground border border-dark-grey items-center"
                        onClick={() => setFundingSource('balance')}
                      >
                        {fundingSource === 'balance' ? (
                          <CircleCheck className="size-5 text-background fill-white" />
                        ) : (
                          <Circle className="size-5 text-grey" />
                        )}{' '}
                        Use <span className="font-bold">Liquid Balance</span> (
                        {formatARIOWithCommas(liquidArIOBalance)} ARIO)
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="any"
                        className="flex w-full gap-2 p-3 rounded bg-foreground border border-dark-grey items-center"
                        onClick={() => setFundingSource('any')}
                      >
                        {fundingSource === 'any' ? (
                          <CircleCheck className="size-5 text-background fill-white" />
                        ) : (
                          <Circle className="size-5 text-grey" />
                        )}{' '}
                        Use{' '}
                        <span className="font-bold">
                          Liquid + Staked Balances
                        </span>{' '}
                        ({formatARIOWithCommas(allArIOBalance)} ARIO)
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="stakes"
                        className="flex w-full gap-2 p-3 rounded bg-foreground border border-dark-grey items-center"
                        onClick={() => setFundingSource('stakes')}
                      >
                        {fundingSource === 'stakes' ? (
                          <CircleCheck className="size-5 text-background fill-white" />
                        ) : (
                          <Circle className="size-5 text-grey" />
                        )}{' '}
                        Use <span className="font-bold">Staked Balances</span> (
                        {formatARIOWithCommas(stakedAndVaultedArIOBalance)}{' '}
                        ARIO)
                      </Tabs.Trigger>
                    </Tabs.List>
                  </Tabs.Root>
                </div>
              </Tabs.Content>
              <Tabs.Content
                value="credits"
                className={`flex flex-col data-[state=active]:p-4 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0`}
              >
                <span className="text-grey flex m-auto">Coming Soon!</span>
              </Tabs.Content>
            </Tabs.Root>{' '}
            <div className="flex w-full box-border">
              <TransactionDetails
                details={costDetailsParams}
                fundingSourceCallback={(v) => setFundingSource(v)}
              />
            </div>
            <div
              className="flex"
              style={{
                marginTop: 20,
                width: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <WorkflowButtons
                onNext={
                  !costDetail ||
                  (costDetail.fundingPlan?.shortfall &&
                    costDetail.fundingPlan?.shortfall > 0)
                    ? undefined
                    : () => handleNext()
                }
                onBack={() => navigate(-1)}
                backText={'Back'}
                nextText={'Confirm'}
                customBackStyle={{ fontSize: '.875rem', padding: '.625rem' }}
                customNextStyle={{
                  width: '100px',
                  fontSize: '.875rem',
                  padding: '.625rem',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionReview;
