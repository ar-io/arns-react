import {
  ARIOWriteable,
  AoARIOWrite,
  FundFrom,
  mARIOToken,
} from '@ar.io/sdk/web';
import DomainCheckoutCard from '@src/components/cards/DomainCheckoutCard';
import PaymentOptionsForm, {
  PaymentMethod,
} from '@src/components/forms/PaymentOptionsForm/PaymentOptionsForm';
import { StepProgressBar } from '@src/components/layout/progress';
import { useIsMobile } from '@src/hooks';
import { useArNSIntentPrice } from '@src/hooks/useArNSIntentPrice';
import {
  COST_DETAIL_STALE_TIME,
  useCostDetails,
} from '@src/hooks/useCostDetails';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { useTurboCreditBalance } from '@src/hooks/useTurboCreditBalance';
import { PaymentInformation } from '@src/services/turbo/TurboArNSClient';
import { dispatchArNSUpdate, useArNSState } from '@src/state';
import dispatchArIOInteraction from '@src/state/actions/dispatchArIOInteraction';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import {
  ARNS_INTERACTION_TYPES,
  ArNSInteractionTypeToIntentMap,
  BuyRecordPayload,
  TRANSACTION_TYPES,
} from '@src/types';
import { formatARIOWithCommas } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// page on route transaction/review
// on completion routes to transaction/complete
function Checkout() {
  const navigate = useNavigate();
  const [{ arioContract, arioProcessId, aoNetwork, aoClient, arioTicker }] =
    useGlobalState();
  const turbo = useTurboArNSClient();
  const [, dispatchArNSState] = useArNSState();
  const [{ walletAddress, wallet }] = useWalletState();
  const { data: creditsBalance } = useTurboCreditBalance();
  const [
    { workflowName, interactionType, transactionData, interactionResult },
    dispatchTransactionState,
  ] = useTransactionState();
  const transaction = transactionData as BuyRecordPayload;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [paymentInformation, setPaymentInformation] =
    useState<PaymentInformation>();
  const [isValid, setIsValid] = useState<boolean>(false);
  const [fundingSource, setFundingSource] = useState<FundFrom | undefined>(
    'balance',
  );
  const [promoCode, setPromoCode] = useState<string>();
  const costDetailsParams = useMemo(() => {
    return {
      ...((transactionData ?? {}) as any),
      intent:
        ArNSInteractionTypeToIntentMap[workflowName as ARNS_INTERACTION_TYPES],
      fromAddress: walletAddress?.toString(),
      fundFrom:
        paymentMethod === 'crypto'
          ? fundingSource
          : paymentMethod === 'credits'
          ? 'turbo'
          : undefined,
      quantity: (transactionData as any)?.qty,
    };
  }, [
    transactionData,
    workflowName,
    walletAddress,
    fundingSource,
    paymentMethod,
  ]);
  const {
    data: costDetail,
    dataUpdatedAt: costDetailUpdatedAt,
    isLoading: isLoadingCostDetail,
  } = useCostDetails(costDetailsParams);
  const {
    data: intentPrice,
    dataUpdatedAt: intentPriceUpdatedAt,
    isLoading: isLoadingIntentPrice,
  } = useArNSIntentPrice({
    intent: costDetailsParams.intent,
    name: transaction?.name,
    type: costDetailsParams.type,
    years: costDetailsParams.years,
    increaseQty: costDetailsParams.quantity,
    promoCode,
  });
  const isMobile = useIsMobile();

  const isInsufficientBalance = useMemo(() => {
    if (paymentMethod === 'card') return false;
    if (paymentMethod === 'crypto') {
      return costDetail?.fundingPlan?.shortfall ? true : false;
    }
    if (paymentMethod === 'credits') {
      if (!costDetail?.wincQty || !creditsBalance?.effectiveBalance) {
        return false;
      }
      return (
        Number(costDetail.wincQty) > Number(creditsBalance.effectiveBalance)
      );
    }
    return true;
  }, [costDetail, paymentMethod, creditsBalance]);

  const fees = useMemo(() => {
    if (paymentMethod === 'card') {
      const discounts =
        intentPrice?.fiatEstimate?.adjustments?.reduce((acc, curr) => {
          acc[curr.name] = (
            <span className="text-error text-bold text-lg">
              ${formatARIOWithCommas(Number(curr.adjustmentAmount) / 100)} USD
            </span>
          );
          return acc;
        }, {}) ?? {};
      return {
        ...discounts,
        'Total due:': (
          <span className="text-white text-bold text-lg">
            $
            {formatARIOWithCommas(
              (intentPrice?.fiatEstimate.paymentAmount ?? 0) / 100,
            )}{' '}
            USD
          </span>
        ),
      };
    }
    if (paymentMethod === 'crypto') {
      const discount = costDetail?.discounts.reduce((acc, curr) => {
        return acc + curr.discountTotal;
      }, 0);

      const arioCost = new mARIOToken(costDetail?.tokenCost ?? 0)
        .toARIO()
        .valueOf();

      return {
        ...(discount
          ? {
              '(operator discount applied)': (
                <span className="text-error text-bold text-lg">
                  -
                  {formatARIOWithCommas(
                    new mARIOToken(discount).toARIO().valueOf(),
                  )}{' '}
                  {arioTicker}
                </span>
              ),
            }
          : {}),
        'Total due:':
          arioCost > 0 ? (
            <span className="text-white text-bold text-lg">
              {formatARIOWithCommas(arioCost)} {arioTicker}
            </span>
          ) : (
            <span className="text-grey text-bold text-lg animate-pulse">
              Loading...
            </span>
          ),
      };
    }
    if (paymentMethod === 'credits') {
      return {
        'Total due:':
          costDetail?.wincQty && Number(costDetail?.wincQty) > 0 ? (
            <span className="text-white text-bold text-lg">
              {formatARIOWithCommas(
                turbo?.wincToCredits(Number(costDetail?.wincQty ?? 0)) ?? 0,
              )}{' '}
              Credits
            </span>
          ) : (
            <span className="text-grey text-bold text-lg animate-pulse">
              Loading...
            </span>
          ),
      };
    }
    return {
      '': 'Invalid payment method selected',
    };
  }, [costDetail, paymentMethod, intentPrice, promoCode]);

  const orderSummary = useMemo(() => {
    switch (workflowName) {
      case ARNS_INTERACTION_TYPES.BUY_RECORD:
        return {
          'Lease Duration':
            transaction?.type === TRANSACTION_TYPES.BUY
              ? 'Permabuy (never expires)'
              : `${transaction?.years} ${
                  transaction?.years && transaction?.years > 1
                    ? 'years'
                    : 'year'
                }`,
          Undernames: '10 included',
        };
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        return {
          Undernames: (
            <div className="flex items-center gap-2">
              {' '}
              <span className="text-white bg-white/10 p-1 px-3 rounded font-bold">
                {(transactionData as any)?.oldQty}
              </span>{' '}
              +{' '}
              <span className="text-success bg-success-thin p-1 px-3 rounded font-bold">
                {transaction?.qty}
              </span>
            </div>
          ),
        };
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        return {
          'Lease Duration': (
            <span className="text-white">
              {transaction?.years}{' '}
              {transaction?.years && transaction?.years > 1 ? 'years' : 'year'}
            </span>
          ),
        };
      case ARNS_INTERACTION_TYPES.UPGRADE_NAME:
        return {
          'Lease Duration': (
            <span className="text-success font-sans-bold">Permanent</span>
          ),
        };
      default:
        return {};
    }
  }, [workflowName, transaction]);

  const quoteEndTimestamp = useMemo(() => {
    if (paymentMethod === 'card') {
      return intentPriceUpdatedAt + COST_DETAIL_STALE_TIME;
    }
    if (paymentMethod === 'crypto') {
      return costDetailUpdatedAt + COST_DETAIL_STALE_TIME;
    }
    if (paymentMethod === 'credits') {
      return costDetailUpdatedAt + COST_DETAIL_STALE_TIME;
    }
    return -1;
  }, [costDetailUpdatedAt, paymentMethod, costDetail, intentPriceUpdatedAt]);

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

  function handleRefresh() {
    queryClient.resetQueries({
      predicate: (query) => {
        return query.queryKey[0] === 'getCostDetails';
      },
    });
  }

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

      if (!turbo) {
        throw new Error('Turbo ArNS Client is not connected');
      }
      // TODO: check that it's connected
      await dispatchArIOInteraction({
        arioContract: arioContract as AoARIOWrite,
        workflowName: workflowName as ARNS_INTERACTION_TYPES,
        payload: {
          ...transactionData,
          paymentMethodId: paymentInformation?.paymentMethodId,
          email: paymentInformation?.email,
        },
        owner: walletAddress,
        processId: arioProcessId,
        dispatch: dispatchTransactionState,
        signer: wallet?.contractSigner,
        ao: aoClient,
        scheduler: aoNetwork.ARIO.SCHEDULER,
        fundFrom:
          paymentMethod === 'card'
            ? 'fiat'
            : paymentMethod === 'credits'
            ? 'turbo'
            : fundingSource,
        turboArNSClient: turbo,
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
        className="flex flex-col center"
        style={isMobile ? {} : { gap: '0px', maxWidth: '900px', width: '100%' }}
      >
        <div className="flex flex-row border-b border-dark-grey pb-6 w-full mb-10">
          {workflowName === ARNS_INTERACTION_TYPES.BUY_RECORD ? (
            <StepProgressBar
              stage={3}
              stages={[
                {
                  title: 'Choose',
                  description: 'Pick a name',
                  status: 'finish',
                },
                {
                  title: 'Configure',
                  description: 'Choose purchase duration',
                  status: 'finish',
                },
                {
                  title: 'Checkout',
                  description: 'Complete payment',
                  status: 'process',
                },
              ]}
            />
          ) : (
            <span className="text-white text-bold text-2xl">Review</span>
          )}
        </div>

        <div className="flex md:flex-row flex-col gap-6 w-full h-full">
          <div className="md:w-1/2 w-full flex flex-col">
            <DomainCheckoutCard
              domain={transaction?.name}
              antId={transaction?.processId}
              targetId={transaction?.targetId?.toString()}
              orderSummary={orderSummary}
              fees={fees}
              quoteEndTimestamp={quoteEndTimestamp}
              refresh={handleRefresh}
            />
          </div>
          <div className="md:w-1/2 w-full flex flex-col">
            <PaymentOptionsForm
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              fundingSource={fundingSource}
              onFundingSourceChange={setFundingSource}
              isInsufficientBalance={isInsufficientBalance}
              setIsValid={setIsValid}
              onPaymentInformationChange={setPaymentInformation}
              promoCode={promoCode}
              setPromoCode={async (promoCode) => {
                const priceRes = await turbo?.getPriceForArNSIntent({
                  address: walletAddress?.toString() ?? '',
                  intent: costDetailsParams.intent,
                  name: transaction?.name,
                  type: transaction?.type,
                  years: transaction?.years,
                  promoCode,
                });
                if (priceRes?.fiatEstimate.adjustments.length === 0) {
                  throw new Error('Invalid promo code');
                } else {
                  setPromoCode(promoCode);
                }
              }}
            />
          </div>
        </div>
        <div className={`flex justify-end items-end w-full pt-6`}>
          <div className="flex gap-4 w-full justify-end text-[0.875rem]">
            <button
              className="p-[0.625rem] rounded border border-dark-grey text-grey w-[100px]"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              disabled={
                isInsufficientBalance ||
                isLoadingCostDetail ||
                isLoadingIntentPrice ||
                !isValid ||
                (!paymentInformation && paymentMethod === 'card')
              }
              className="p-[0.625rem] bg-primary rounded w-[100px] min-w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
            >
              {isLoadingCostDetail
                ? 'Loading...'
                : isInsufficientBalance
                ? 'Insufficient balance'
                : 'Pay now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
