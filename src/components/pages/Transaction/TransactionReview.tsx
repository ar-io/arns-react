import { ARIOWriteable, AoARIOWrite, FundFrom } from '@ar.io/sdk/web';
import ANTDetailsTip from '@src/components/Tooltips/ANTDetailsTip';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import PaymentOptionsForm, {
  PaymentMethod,
} from '@src/components/forms/PaymentOptionsForm/PaymentOptionsForm';
import { ArNSLogo } from '@src/components/icons';
import { StepProgressBar } from '@src/components/layout/progress';
import { useIsMobile } from '@src/hooks';
import {
  COST_DETAIL_STALE_TIME,
  useCostDetails,
} from '@src/hooks/useCostDetails';
import { useCountdown } from '@src/hooks/useCountdown';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { dispatchArNSUpdate, useArNSState } from '@src/state';
import dispatchArIOInteraction from '@src/state/actions/dispatchArIOInteraction';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import {
  ARNS_INTERACTION_TYPES,
  ArNSInteractionTypeToIntentMap,
  TRANSACTION_TYPES,
} from '@src/types';
import {
  getWorkflowStepsForInteraction,
  isArweaveTransactionID,
} from '@src/utils';
import { DEFAULT_ANT_LOGO, NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { StepProps } from 'antd';
import { RotateCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const { data: domainInfo } = useDomainInfo({
    antId: (transactionData as any)?.processId,
  });
  const isMobile = useIsMobile();

  const [steps, setSteps] = useState<StepProps[] | undefined>(
    getWorkflowStepsForInteraction(interactionType),
  );

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
  const { data: costDetail, dataUpdatedAt: costDetailTimestamp } =
    useCostDetails(costDetailsParams);

  const countdownString = useCountdown(
    costDetailTimestamp + COST_DETAIL_STALE_TIME,
  );

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
          <div
            className="flex flex-row"
            style={{
              marginBottom: '60px',
              width: '100%',
            }}
          >
            <StepProgressBar stage={3} stages={steps} />
          </div>
        ) : (
          <></>
        )}

        <div className="flex gap-6 w-full h-full">
          <div className="relative flex flex-col w-1/2 h-full bg-gradient-to-r from-[#FEC35F] to-[#EEA5D2] rounded p-[1px] overflow-hidden">
            {/* domain detail card */}
            <ArNSLogo className="absolute w-[320px] h-fit top-[0px] right-[0px] " />
            <div className="flex flex-col size-full bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-t text-light-grey p-6">
              <div className="flex w-full gap-2 items-center">
                <AntLogoIcon
                  id={
                    isArweaveTransactionID((transactionData as any).processId)
                      ? domainInfo?.logo
                      : DEFAULT_ANT_LOGO
                  }
                />
                <div className="flex w-full items-center">
                  {' '}
                  <Link
                    className="link"
                    to={`${(transactionData as any).name}.${
                      NETWORK_DEFAULTS.ARNS.HOST
                    }`}
                  >
                    ar://
                  </Link>
                  <span> {(transactionData as any).name.slice(0, 10)}</span>
                </div>{' '}
                {isArweaveTransactionID((transactionData as any).processId) && (
                  <ANTDetailsTip antId={(transactionData as any).processId} />
                )}
              </div>
              {/* Order Info */}
              <div
                className={`flex flex-col border-y-[1px] border-foreground gap-4 mt-8 py-6 size-full`}
              >
                <div className="flex w-full justify-between pb-4">
                  <span className="whitespace-nowrap">Order Summary</span>
                </div>
                <div className="flex flex-row w-full text-sm">
                  <span className="flex w-1/3 whitespace-nowrap text-grey">
                    Lease Duration
                  </span>
                  <span className="flex w-1/2 whitespace-nowrap">
                    {(transactionData as any).type === TRANSACTION_TYPES.BUY
                      ? 'Permanent'
                      : `${(transactionData as any).years} year${
                          (transactionData as any).years > 1 ? 's' : ''
                        }`}
                  </span>
                </div>

                <div className="flex flex-row w-full text-sm">
                  <span className="flex w-1/3 whitespace-nowrap text-grey">
                    Undernames
                  </span>
                  <span className="flex w-1/2 whitespace-nowrap">
                    10 included
                  </span>
                </div>
              </div>
              {/* Prices */}
              <div className="flex flex-col gap-4 py-6">
                <div className="flex w-full justify-between pb-4">
                  <span className="whitespace-nowrap">Order Summary</span>
                </div>
              </div>
            </div>
            {/* Quote update timer */}
            <div className="flex w-full bg-foreground rounded-b px-6 p-3 text-grey justify-between text-sm">
              <span>
                {countdownString ? (
                  <span className="whitespace-nowrap">
                    Quote updates in{' '}
                    <span className="text-white text-bold">
                      {countdownString}
                    </span>
                  </span>
                ) : (
                  <span className="animate-pulse">Updating quote...</span>
                )}
              </span>
              <button className="flex gap-2 items-center justify-center text-center text-grey pointer">
                <RotateCw className="text-grey size-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="w-1/2 flex flex-col">
            <PaymentOptionsForm
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              fundingSource={fundingSource}
              onFundingSourceChange={setFundingSource}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionReview;
