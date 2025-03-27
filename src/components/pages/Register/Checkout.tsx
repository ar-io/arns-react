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
import {
  COST_DETAIL_STALE_TIME,
  useCostDetails,
} from '@src/hooks/useCostDetails';
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
import {
  formatARIOWithCommas,
  getWorkflowStepsForInteraction,
} from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { StepProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// page on route transaction/review
// on completion routes to transaction/complete
function Checkout() {
  const navigate = useNavigate();
  const [{ arioContract, arioProcessId, aoNetwork, aoClient }] =
    useGlobalState();
  const [, dispatchArNSState] = useArNSState();
  const [{ walletAddress, wallet }] = useWalletState();
  const [
    { workflowName, interactionType, transactionData, interactionResult },
    dispatchTransactionState,
  ] = useTransactionState();
  const transaction = transactionData as BuyRecordPayload;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [fundingSource, setFundingSource] = useState<FundFrom | undefined>(
    'balance',
  );

  const costDetailsParams = {
    ...((transactionData ?? {}) as any),
    intent:
      ArNSInteractionTypeToIntentMap[workflowName as ARNS_INTERACTION_TYPES],
    fromAddress: walletAddress?.toString(),
    fundFrom: fundingSource,
    quantity: (transactionData as any)?.qty,
  };
  const { data: costDetail, dataUpdatedAt: costDetailUpdatedAt } =
    useCostDetails(costDetailsParams);
  const isMobile = useIsMobile();

  const [steps, setSteps] = useState<StepProps[] | undefined>(
    getWorkflowStepsForInteraction(interactionType),
  );

  const fees = useMemo(() => {
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
                  $ARIO
                </span>
              ),
            }
          : {}),
        'Total due:':
          arioCost > 0 ? (
            <span className="text-white text-bold text-lg">
              {formatARIOWithCommas(arioCost)} $ARIO
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
  }, [costDetail, paymentMethod]);

  const quoteEndTimestamp = useMemo(() => {
    if (paymentMethod === 'crypto') {
      return costDetailUpdatedAt + COST_DETAIL_STALE_TIME;
    }
    return -1;
  }, [costDetailUpdatedAt, paymentMethod]);

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

    setSteps(getWorkflowStepsForInteraction(interactionType));
  }, [interactionResult, navigate, interactionType]);

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
        className="flex flex-col center"
        style={isMobile ? {} : { gap: '0px', maxWidth: '900px', width: '100%' }}
      >
        {steps && steps.length ? (
          <div className="flex flex-row border-b border-dark-grey pb-6 w-full mb-10">
            <StepProgressBar stage={3} stages={steps} />
          </div>
        ) : (
          <></>
        )}

        <div className="flex md:flex-row flex-col gap-6 w-full h-full">
          <div className="md:w-1/2 w-full flex flex-col">
            <DomainCheckoutCard
              domain={transaction.name}
              antId={transaction.processId}
              orderSummary={{
                'Lease Duration':
                  transaction.type === TRANSACTION_TYPES.BUY
                    ? 'Permabuy (never expires)'
                    : `${transaction.years} ${
                        transaction.years && transaction.years > 1
                          ? 'years'
                          : 'year'
                      }`,
                Undernames: '10 included',
              }}
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
            />
          </div>
        </div>
        <div className={`flex justify-end items-end w-full pt-6`}>
          <div className="flex gap-4">
            <button
              className="py-4 px-5 rounded border border-dark-grey text-grey w-[112px]"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              className="py-4 px-5 bg-primary rounded w-[112px]"
              onClick={handleNext}
            >
              Pay now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
