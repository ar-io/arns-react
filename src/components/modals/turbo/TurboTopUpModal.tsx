import { TokenType, USD } from '@ardrive/turbo-sdk/web';
import { Tooltip } from '@src/components/data-display';
import { TurboLogo } from '@src/components/icons';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { PaymentInformation } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { WALLET_TYPES } from '@src/types';
import { LINK_HOW_ARE_CONVERSIONS_DETERMINED } from '@src/utils/constants';
import { Elements } from '@stripe/react-stripe-js';
import {
  PaymentIntent,
  PaymentIntentResult,
  loadStripe,
} from '@stripe/stripe-js';
import { CreditCard, ExternalLinkIcon, Wallet, XIcon } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useEffect, useMemo, useState } from 'react';

import CurrencyConfigurationPanel from './panels/CurrencyConfigurationPanel';
import CryptoConfigurationPanel from './panels/crypto/CryptoConfigurationPanel';
import CryptoConfirmation, {
  CryptoTopupQuote,
} from './panels/crypto/CryptoConfirmation';
import CryptoManualTopup from './panels/crypto/CryptoManualTopup';
import CryptoTopupComplete from './panels/crypto/CryptoTopupComplete';
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
  | 'crypto-configure'
  | 'crypto-confirm'
  | 'crypto-manual'
  | 'crypto-success';

type PaymentMethod = 'fiat' | 'crypto';

function BaseTurboTopUpModal({ onClose }: { onClose: () => void }) {
  const [{ wallet, walletAddress }] = useWalletState();
  const walletType = window.localStorage.getItem('walletType');
  const turbo = useTurboArNSClient();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fiat');

  const [panelState, setPanelState] = useState<PanelStates>('configure');

  // Fiat payment state
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();
  const [paymentAmount, setPaymentAmount] = useState<number>();
  const [promoCode, setPromoCode] = useState<string>();
  const [paymentInformation, setPaymentInformation] =
    useState<PaymentInformation>();
  const [paymentIntentError, setPaymentIntentError] = useState<string>();
  const [valueString, setValueString] = useState<string>(valueStringDefault);
  const [topupValue, setTopupValue] = useState<number>();
  const [, setPaymentIntentResult] = useState<PaymentIntentResult>();

  // Crypto payment state
  const [selectedToken, setSelectedToken] = useState<TokenType>('arweave');
  const [cryptoTopupValue, setCryptoTopupValue] = useState<number>();
  const [cryptoValueString, setCryptoValueString] = useState<string>(
    '0 = 0 credits ≈ 0 GB',
  );
  const [cryptoQuote, setCryptoQuote] = useState<CryptoTopupQuote>();

  // Set default token based on wallet type
  useEffect(() => {
    if (walletType === WALLET_TYPES.ETHEREUM) {
      setSelectedToken('ethereum');
    } else {
      setSelectedToken('arweave');
    }
  }, [walletType]);

  // Update payment intent for fiat
  useEffect(() => {
    async function updatePaymentIntent() {
      if (paymentMethod !== 'fiat') return;

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
    }
    updatePaymentIntent();
  }, [walletAddress, topupValue, wallet, paymentMethod, turbo]);

  useEffect(() => {
    // Prevent user from leaving the page when payment is in progress
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        panelState === 'payment' ||
        panelState === 'confirm' ||
        panelState === 'crypto-confirm' ||
        panelState === 'crypto-manual'
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [panelState]);

  function handleClose() {
    if (
      panelState === 'payment' ||
      panelState === 'confirm' ||
      panelState === 'crypto-confirm' ||
      panelState === 'crypto-manual'
    ) {
      if (window.confirm('Are you sure you want to close this payment?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
    // Reset to configure state when switching payment methods
    if (method === 'fiat') {
      setPanelState('configure');
    } else {
      setPanelState('crypto-configure');
    }
  }

  // Only show payment method tabs on the configure screens
  const showPaymentTabs =
    panelState === 'configure' || panelState === 'crypto-configure';

  return (
    <div className="modal-container relative">
      <div className="flex flex-col rounded bg-metallic-grey border border-dark-grey gap-2 w-[30rem] overflow-hidden">
        {/* Header */}
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

        {/* Payment Method Tabs - Only show on configure screens */}
        {showPaymentTabs && (
          <div className="flex px-6 pt-4">
            <div className="flex bg-dark-grey rounded-lg p-1 w-full">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === 'fiat'
                    ? 'bg-white text-black'
                    : 'text-grey hover:text-white'
                }`}
                onClick={() => handlePaymentMethodChange('fiat')}
              >
                <CreditCard className="w-4 h-4" />
                Credit Card
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  paymentMethod === 'crypto'
                    ? 'bg-white text-black'
                    : 'text-grey hover:text-white'
                }`}
                onClick={() => handlePaymentMethodChange('crypto')}
              >
                <Wallet className="w-4 h-4" />
                Crypto
              </button>
            </div>
          </div>
        )}

        {/* Panel Content */}
        <Tabs.Root value={panelState} className="flex h-full w-full text-white">
          {/* Fiat Configure Panel */}
          <Tabs.Content
            value="configure"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <CurrencyConfigurationPanel
              setTopupValue={setTopupValue}
              valueString={valueString}
              setValueString={setValueString}
              paymentIntentError={paymentIntentError}
              disableNext={valueString === valueStringError || !topupValue}
              onNext={() => {
                if (paymentIntent) {
                  setPanelState('payment');
                }
              }}
            />
          </Tabs.Content>

          {/* Crypto Configure Panel */}
          <Tabs.Content
            value="crypto-configure"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <CryptoConfigurationPanel
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
              setTopupValue={setCryptoTopupValue}
              valueString={cryptoValueString}
              setValueString={setCryptoValueString}
              disableNext={!cryptoTopupValue || cryptoTopupValue <= 0}
              onNext={() => {
                setPanelState('crypto-confirm');
              }}
            />
          </Tabs.Content>

          {/* Fiat Payment Panel */}
          <Tabs.Content
            value="payment"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
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
          </Tabs.Content>

          {/* Fiat Confirm Panel */}
          <Tabs.Content
            value="confirm"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
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
          </Tabs.Content>

          {/* Fiat Success Panel */}
          <Tabs.Content
            value="success"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <FiatTopupComplete onFinish={() => handleClose()} />
          </Tabs.Content>

          {/* Crypto Confirm Panel */}
          <Tabs.Content
            value="crypto-confirm"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <CryptoConfirmation
              cryptoAmount={cryptoTopupValue || 0}
              tokenType={selectedToken}
              onBack={() => setPanelState('crypto-configure')}
              onComplete={() => {
                setPanelState('crypto-success');
              }}
              onManualPayment={(quote) => {
                setCryptoQuote(quote);
                setPanelState('crypto-manual');
              }}
            />
          </Tabs.Content>

          {/* Crypto Manual Payment Panel */}
          <Tabs.Content
            value="crypto-manual"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            {cryptoQuote && (
              <CryptoManualTopup
                quote={cryptoQuote}
                onBack={() => setPanelState('crypto-confirm')}
                onComplete={() => setPanelState('crypto-success')}
              />
            )}
          </Tabs.Content>

          {/* Crypto Success Panel */}
          <Tabs.Content
            value="crypto-success"
            className={`flex flex-col rounded h-full data-[state=inactive]:size-0 data-[state=active]:size-full data-[state=inactive]:opacity-0 transition-all duration-300 ease-in-out`}
          >
            <CryptoTopupComplete onFinish={() => handleClose()} />
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
  // we wrap the modal in an Elements component to ensure that the CardElement is mounted separately from the global elements context
  // if two card elements are mounted at the same time, the second one will CRASH the app
  return (
    <Elements stripe={stripePromise}>
      <BaseTurboTopUpModal onClose={onClose} />
    </Elements>
  );
}

export default TurboTopUpModal;
