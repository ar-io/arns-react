import Countdown from '@src/components/data-display/Countdown';
import { RefreshIcon, TurboLogo } from '@src/components/icons';
import { Checkbox } from '@src/components/inputs/Checkbox';
import { useEstimatedCreditsForUSD } from '@src/hooks/useEstimatedCreditsForUSD';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { buildTurboCreditBalanceQuery } from '@src/hooks/useTurboCreditBalance';
import { PaymentInformation } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { useStripe } from '@stripe/react-stripe-js';
import { PaymentIntent, PaymentIntentResult } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

import { valueStringError } from '../../TurboTopUpModal';

function FiatConfirmation({
  paymentAmount,
  paymentIntent,
  paymentInformation,
  promoCode,
  setPaymentIntentResult,
  onBack,
  onSubmit,
}: {
  paymentAmount?: number;
  paymentIntent?: PaymentIntent;
  paymentInformation?: PaymentInformation;
  promoCode?: string;
  setPaymentIntentResult: (result: PaymentIntentResult) => void;
  setPaymentInformation: (information?: PaymentInformation) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const stripe = useStripe();
  const turbo = useTurboArNSClient();
  const [{ turboNetwork }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const { data: estimatedCredits, dataUpdatedAt: creditsEstimateUpdatedAt } =
    useEstimatedCreditsForUSD({
      paymentAmount,
      promoCode,
    });

  const [countdownEndTimestamp, setCountdownEndTimestamp] = useState<number>(
    Date.now() + 5 * 60 * 1000,
  );

  const [tosAgreed, setTosAgreed] = useState<boolean>(false);

  const [paymentError, setPaymentError] = useState<string>();

  const [sendingPayment, setSendingPayment] = useState<boolean>(false);

  useEffect(() => {
    setCountdownEndTimestamp(creditsEstimateUpdatedAt + 5 * 60 * 1000);
  }, [creditsEstimateUpdatedAt]);

  const submitPayment = async () => {
    if (!stripe || !paymentIntent?.client_secret || !paymentInformation) {
      return;
    }

    setSendingPayment(true);

    try {
      const updateCreditBalanceQuery = buildTurboCreditBalanceQuery({
        userAddress: walletAddress?.toString(),
        turboArNSClient: turbo,
        turboNetwork,
      });
      const prevBalance = await queryClient.fetchQuery(
        updateCreditBalanceQuery,
      );
      const result = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: paymentInformation.paymentMethodId,
          receipt_email: paymentInformation.email,
        },
      );

      if (result.error) {
        console.error(result.error.message);
        setPaymentError(result.error.message);
      } else {
        let retries = 0;
        while (retries <= 10) {
          queryClient.invalidateQueries({
            queryKey: ['turbo-credit-balance'],
          });
          const newBalance = await queryClient.fetchQuery(
            updateCreditBalanceQuery,
          );
          if (newBalance.effectiveBalance !== prevBalance.effectiveBalance) {
            break;
          }
          await sleep(1000 * retries ** 2);
          retries++;
        }

        setPaymentIntentResult(result);
      }
      onSubmit();
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setSendingPayment(false);
    }
  };

  const actualPaymentAmount = estimatedCredits
    ? estimatedCredits.actualPaymentAmount / 100
    : 0;
  const paymentAmountUSD = paymentAmount ? paymentAmount / 100 : 0;
  return (
    <div className="flex size-full flex-col items-start text-left">
      <div className="flex w-full justify-between px-6 pt-2 pb-4">
        <div className="font-bold">Review</div>
      </div>

      <div className="w-full bg-black/50 border-t border-dark-grey px-6 py-4">
        <TurboLogo className="w-12" />
        {estimatedCredits ? (
          <>
            <div className="flex w-full flex-col items-center py-2">
              <div className="text-3xl font-bold">
                {turbo
                  ?.wincToCredits(Number(estimatedCredits?.winc) || 0)
                  .toFixed(4)}
              </div>
              <div className="text-sm text-grey">Credits</div>
            </div>
            {paymentAmount && actualPaymentAmount !== paymentAmountUSD && (
              <>
                <div className="flex w-full border-t border-dark-grey py-2 text-sm text-grey">
                  <div>Subtotal:</div>
                  <div className="grow text-right">
                    ${paymentAmountUSD.toFixed(2)}
                  </div>
                </div>
                <div className="flex w-full border-t border-dark-grey py-2 text-sm text-grey">
                  <div>Discount:</div>
                  <div className="grow text-right">
                    -$
                    {Math.abs(actualPaymentAmount - paymentAmountUSD).toFixed(
                      2,
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="flex w-full border-t border-dark-grey pt-4 text-sm">
              <div>Total:</div>
              <div className="grow text-right">
                ${actualPaymentAmount.toFixed(2)}
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center py-4">
            <div className="center text-xl font-bold text-error">
              {valueStringError}
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full  items-center bg-foreground px-6 py-2.5 border-y border-dark-grey text-center text-sm  text-grey fill-grey">
        <div className="grow text-left">
          Quote Updates in{' '}
          <span>
            <Countdown endTimestamp={countdownEndTimestamp} />
          </span>
        </div>

        <button
          className="flex items-center justify-center gap-1 text-right hover:text-white hover:fill-white"
          onClick={() => {
            queryClient.resetQueries({
              queryKey: ['estimatedCredits'],
            });
          }}
        >
          <RefreshIcon className="size-5" /> Refresh
        </button>
      </div>

      <div className="flex items-center px-6 pt-4 justify-center">
        <Checkbox
          checked={tosAgreed}
          onCheckedChange={(value) => setTosAgreed(Boolean(value))}
          className="size-4 whitespace-nowrap"
        />

        <label
          htmlFor="tosCheckbox"
          className="text-sm  ml-2 flex items-center gap-1 justify-center whitespace-nowrap"
        >
          I agree to the{' '}
          <a
            href="https://ardrive.io/tos-and-privacy/"
            className="text-link whitespace-nowrap"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ArDrive terms of service and privacy policy"
          >
            ArDrive terms of service and privacy policy
          </a>
          .
        </label>
      </div>

      <div className="flex gap-2 w-full justify-end border-t border-dark-grey py-3 mt-4 px-6 items-center">
        <div className="w-full justify-center text-sm text-error">
          {paymentError ?? <></>}
        </div>

        <button
          className="text-grey hover:text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          Back
        </button>

        <button
          disabled={!tosAgreed || sendingPayment || !estimatedCredits}
          className="text-black border border-dark-grey bg-primary px-4 py-2 rounded disabled:opacity-50"
          onClick={submitPayment}
        >
          {sendingPayment ? 'Processing...' : 'Pay'}
        </button>
      </div>
    </div>
  );
}

export default FiatConfirmation;
