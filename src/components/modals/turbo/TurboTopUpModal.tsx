import { USD } from '@ardrive/turbo-sdk/web';
import { Tooltip } from '@src/components/data-display';
import { TurboLogo } from '@src/components/icons';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { PaymentInformation } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { LINK_HOW_ARE_CONVERSIONS_DETERMINED } from '@src/utils/constants';
import { Elements } from '@stripe/react-stripe-js';
import {
  PaymentIntent,
  PaymentIntentResult,
  loadStripe,
} from '@stripe/stripe-js';
import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useEffect, useMemo, useState } from 'react';

import CurrencyConfigurationPanel from './panels/CurrencyConfigurationPanel';
import CryptoConfirmation from './panels/crypto/CryptoConfirmation';
import CryptoManualTopup from './panels/crypto/CryptoManualTopup';
import CryptoTopupComplete from './panels/crypto/CryptoTopupComplete';
import ResumeCryptoTopup from './panels/crypto/ResumeCryptoTopup';
import FiatConfirmation from './panels/fiat/FiatConfirmation';
import FiatPayment from './panels/fiat/FiatPayment';
import FiatTopupComplete from './panels/fiat/FiatTopupComplete';

export const errorSubmittingTransactionToTurbo =
  'Error submitting transaction to Turbo. Please try again or contact support.';
export const valueStringDefault = '$0 = 0 credits \u{02248} 0 GB';
export const valueStringError = `Error: Unable to fetch credit estimate`;

export type PanelStates =
  | 'configure'
  | 'payment'
  | 'confirm'
  | 'success'
  | 'resume-eth-topup';
type Currency = 'fiat' | 'crypto';

function BaseTurboTopUpModal({ onClose }: { onClose: () => void }) {
  const [{ wallet, walletAddress }] = useWalletState();
  const turbo = useTurboArNSClient();
  const [currency, setCurrency] = useState<Currency>('fiat');

  const [panelState, setPanelState] = useState<PanelStates>('configure');

  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();
  const [paymentAmount, setPaymentAmount] = useState<number>();
  const [promoCode, setPromoCode] = useState<string>();
  const [, setCryptoTopupValue] = useState<number>();
  const [paymentInformation, setPaymentInformation] =
    useState<PaymentInformation>();
  const [paymentIntentError, setPaymentIntentError] = useState<string>();

  const [valueString, setValueString] = useState<string>(valueStringDefault);
  const [topupValue, setTopupValue] = useState<number>();

  const [, setPaymentIntentResult] = useState<PaymentIntentResult>();

  useEffect(() => {
    async function updatePaymentIntent() {
      if (currency === 'fiat') {
        if (!walletAddress || !wallet?.tokenType || !topupValue || !turbo) {
          return;
        }
        try {
          const paymentIntent = await turbo.getTopupPaymentIntent({
            address: walletAddress.toString(),
            amount: USD(topupValue).amount,
            token: wallet.tokenType,
          });
          if (paymentIntent?.paymentSession) {
            setPaymentIntent(paymentIntent.paymentSession);
            setPaymentAmount(USD(topupValue).amount);
            setPaymentIntentError(undefined);
          }
        } catch (e: unknown) {
          setPaymentIntentError((e as Error).message);
          return;
        }
      } else {
        setCryptoTopupValue(topupValue!);
      }
    }
    updatePaymentIntent();
  }, [walletAddress, topupValue, wallet]);

  useEffect(() => {
    // Prevent user from leaving the page when payment is in progress, requires confirmation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (panelState === 'payment' || panelState === 'confirm') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [panelState]);

  function handleClose() {
    if (panelState === 'payment' || panelState === 'confirm') {
      if (window.confirm('Are you sure you want to close this payment?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-container relative">
      <div className="flex flex-col rounded bg-metallic-grey border border-dark-grey gap-2 w-[30rem] overflow-hidden">
        <div className="flex w-full p-6 py-4 text-white border-b border-dark-grey justify-between">
          <span className="flex gap-2 text-lg">
            Purchase Turbo Credits{' '}
            <Tooltip
              tooltipOverrides={{
                overlayInnerStyle: {
                  border: '1px solid var(--text-faded)',
                },
              }}
              message={
                <div className="text-sm text-light-grey flex flex-col gap-2 p-2">
                  Turbo Credits will be added to your wallet and can be used
                  right away. Credit purchases are non-refundable and
                  non-transferable.
                  <button
                    className="flex items-center flex-nowrap gap-1 text-link"
                    onClick={() =>
                      window.open(LINK_HOW_ARE_CONVERSIONS_DETERMINED)
                    }
                  >
                    <div className="whitespace-nowrap">
                      How are conversions determined?
                    </div>
                    <ExternalLinkIcon className="text-grey size-5" />
                  </button>
                </div>
              }
            />
          </span>
          <button onClick={handleClose}>
            <XIcon className="size-5" />
          </button>
        </div>
        <Tabs.Root value={panelState} className="flex h-full w-full text-white">
          <Tabs.Content
            value="configure"
            className={`flex flex-col  rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out `}
          >
            <CurrencyConfigurationPanel
              currency={currency}
              setCurrency={setCurrency}
              setTopupValue={setTopupValue}
              valueString={valueString}
              setValueString={setValueString}
              paymentIntentError={paymentIntentError}
              setPanelState={setPanelState}
              disableNext={valueString === valueStringError || !topupValue}
              onNext={() => {
                if (paymentIntent) {
                  setPanelState('payment');
                }
              }}
            />
          </Tabs.Content>
          {/* resume eth topup panel */}
          <Tabs.Content
            value="resume-eth-topup"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out `}
          >
            <ResumeCryptoTopup onBack={() => setPanelState('configure')} />
          </Tabs.Content>
          {/* payment panel */}
          <Tabs.Content
            value="payment"
            className={`flex flex-col  rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            {currency === 'fiat' ? (
              <FiatPayment
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                setPaymentIntent={setPaymentIntent}
                setPaymentInformation={setPaymentInformation}
                paymentAmount={paymentAmount}
                onBack={() => {
                  setPromoCode(undefined);
                  setPaymentAmount(undefined);
                  setPaymentIntent(undefined);
                  setPaymentInformation(undefined);
                  setPanelState('configure');
                }}
                onSubmit={() => setPanelState('confirm')}
              />
            ) : (
              <CryptoManualTopup />
            )}
          </Tabs.Content>
          {/* confirm panel */}
          <Tabs.Content
            value="confirm"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out `}
          >
            {currency === 'fiat' ? (
              <FiatConfirmation
                paymentAmount={paymentAmount}
                paymentIntent={paymentIntent}
                paymentInformation={paymentInformation}
                promoCode={promoCode}
                setPaymentIntentResult={setPaymentIntentResult}
                setPaymentInformation={setPaymentInformation}
                onBack={() => {
                  setPanelState('payment');
                  setPaymentInformation(undefined);
                }}
                onSubmit={() => setPanelState('success')}
              />
            ) : (
              <CryptoConfirmation />
            )}
          </Tabs.Content>
          {/* success panel */}
          <Tabs.Content
            value="success"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out `}
          >
            {currency === 'fiat' ? (
              <FiatTopupComplete onFinish={() => handleClose()} />
            ) : (
              <CryptoTopupComplete />
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
      <TurboLogo className="absolute bottom-10 right-10 opacity-70" />
    </div>
  );
}

function TurboTopUpModal({ onClose }: { onClose: () => void }) {
  const [{ turboNetwork }] = useGlobalState();
  const stripePromise = useMemo(() => {
    return loadStripe(turboNetwork.STRIPE_PUBLISHABLE_KEY);
  }, [turboNetwork.STRIPE_PUBLISHABLE_KEY]);
  // we wrap the modal in an Elements component to ensure that the CardElement is mounted seperately from the global elements context
  // if two card elements are mounted at the same time, the second one will CRASH the app
  return (
    <Elements stripe={stripePromise}>
      <BaseTurboTopUpModal onClose={onClose} />
    </Elements>
  );
}

export default TurboTopUpModal;
