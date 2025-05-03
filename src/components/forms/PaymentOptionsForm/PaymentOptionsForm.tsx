import { FundFrom, mARIOToken } from '@ar.io/sdk';
import { ArIOTokenIcon, TurboIcon } from '@src/components/icons';
import { Checkbox } from '@src/components/inputs/Checkbox';
import { SelectDropdown } from '@src/components/inputs/Select';
import TurboTopUpModal from '@src/components/modals/turbo/TurboTopUpModal';
import {
  useArIOLiquidBalance,
  useArIOStakedAndVaultedBalance,
} from '@src/hooks/useArIOBalance';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { useTurboCreditBalance } from '@src/hooks/useTurboCreditBalance';
import { PaymentInformation } from '@src/services/turbo/TurboArNSClient';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import Ar from 'arweave/node/ar';
import { Circle, CircleCheck, CircleXIcon, CreditCard } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { isEmail } from 'validator';

export type PaymentMethod = 'card' | 'crypto' | 'credits';
export type ARIOCryptoOptions = 'ARIO' | 'dARIO' | 'tARIO';
export type CryptoOptions = ARIOCryptoOptions;

const FormEntry: FC<{
  name: string;
  label: string;
  children: ReactNode;
  errorText?: string;
}> = ({ name, label, children, errorText }) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="flex text-sm text-grey whitespace-nowrap"
        htmlFor={name}
      >
        {label}
      </label>
      <div className="flex w-full rounded border border-dark-grey">
        {children}
      </div>
      {errorText && <div className="flex text-xs text-error">{errorText}</div>}
    </div>
  );
};

function CardPanel({
  setIsValid,
  onPaymentInformationChange,
  promoCode,
  setPromoCode,
}: {
  promoCode?: string;
  setPromoCode: (promoCode?: string) => Promise<void>;
  setIsValid: (valid: boolean) => void;
  onPaymentInformationChange: (paymentInformation: PaymentInformation) => void;
}) {
  const [{ walletAddress }] = useWalletState();
  const turbo = useTurboArNSClient();
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [localPromoCode, setLocalPromoCode] = useState<string>();
  const [cardComplete, setCardComplete] = useState<boolean>(false);

  const [keepMeUpdated, setKeepMeUpdated] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string>();
  const [cardError, setCardError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [promoCodeError, setPromoCodeError] = useState<string>();

  async function updatePaymentInformation() {
    const cardElement = elements?.getElement(CardElement);
    if (!cardElement || !stripe || !name || !cardComplete) return;

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name,
        email: keepMeUpdated ? email : undefined,
      },
    });
    if (error) {
      eventEmitter.emit('error', error);
    } else if (paymentMethod) {
      onPaymentInformationChange({
        paymentMethodId: paymentMethod.id,
        email,
      });
    }
  }

  useEffect(() => {
    updatePaymentInformation();
  }, [name, email, keepMeUpdated, termsAccepted, promoCode, cardComplete]);

  useEffect(() => {
    if (
      nameError ||
      cardError ||
      emailError ||
      promoCodeError ||
      !cardComplete ||
      !termsAccepted ||
      !name
    ) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [
    nameError,
    cardError,
    emailError,
    promoCodeError,
    cardComplete,
    termsAccepted,
    keepMeUpdated,
    name,
  ]);

  const cardElementOptions: StripeCardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'white',
        '::placeholder': {
          color: '#7d7d85',
        },
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="flex size-full flex-col items-start text-left text-white">
      <div className="flex w-full flex-col text-grey">
        <form className="flex  flex-col gap-3">
          <FormEntry name="name" label="Name on Card *" errorText={nameError}>
            <input
              className="size-full flex  bg-transparent px-4 py-2 outline-none text-white"
              type="text"
              name="name"
              value={name}
              onChange={(e) => {
                const v = e.target.value ?? '';
                const cleaned = v.replace(/[^a-zA-Z\s]/g, '');
                setName(cleaned);
                setNameError(
                  cleaned.length == 0 ? 'Name is required' : undefined,
                );
              }}
            ></input>
          </FormEntry>
          <FormEntry
            name="creditCard"
            label="Credit Card *"
            errorText={cardError}
          >
            <CardElement
              options={cardElementOptions}
              className="size-full bg-transparent px-4 p-2 outline-none whitespace-nowrap h-[2.188rem]"
              onChange={({ error, complete }) => {
                setCardError(error?.message);
                setCardComplete(complete);
              }}
            />
          </FormEntry>

          {promoCode ? (
            <div className="flex flex-col gap-1">
              <span className="flex text-sm text-grey whitespace-nowrap gap-2">
                Promo Code{' '}
                <span className="text-success font-bold">{promoCode}</span>
              </span>
              <div className="flex max-w-fit items-center gap-2 text-sm text-grey whitespace-nowrap">
                Promo code successfully applied.
                <button
                  className="text-white"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (walletAddress && turbo) {
                      try {
                        setPromoCode(undefined);
                        setPromoCodeError(undefined);
                      } catch (e: unknown) {
                        console.error(e);
                        setPromoCodeError(
                          'Error removing promo code, please try again.',
                        );
                      }
                    }
                  }}
                >
                  <CircleXIcon className="size-4 text-success" />
                </button>
              </div>
              {promoCodeError && (
                <div className="text-xs text-error">{promoCodeError}</div>
              )}
            </div>
          ) : (
            <FormEntry
              name="promoCode"
              label="Promo Code"
              errorText={promoCodeError}
            >
              <div className="relative flex w-full">
                <input
                  className="peer flex size-full bg-transparent px-4 py-2 outline-none text-white"
                  type="text"
                  name="promoCode"
                  value={localPromoCode || ''}
                  onChange={(e) => {
                    const v = e.target.value ?? '';
                    const cleaned = v.replace(/[^a-zA-Z0-9\s]/g, '');
                    setLocalPromoCode(cleaned);
                    setPromoCodeError(undefined);
                  }}
                ></input>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-white opacity-0 transition-opacity focus:opacity-100 peer-focus:opacity-100"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      walletAddress &&
                      localPromoCode &&
                      localPromoCode.length > 0 &&
                      turbo
                    ) {
                      try {
                        await setPromoCode(localPromoCode);
                      } catch (e: any) {
                        console.error(e);
                        setPromoCodeError(e.message + ' Invalid promo code.');
                      }
                    } else {
                      setPromoCode(undefined);
                      setPromoCodeError('Promo code is invalid or expired.');
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            </FormEntry>
          )}
          <div className="flex size-full flex-col gap-8">
            <FormEntry
              name="email"
              label="Enter email for a receipt"
              errorText={emailError}
            >
              <input
                type="text"
                className="flex size-full bg-transparent px-4 py-2 outline-none text-white"
                name="email"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmail(newEmail);
                  setEmailError(
                    newEmail.length == 0 || isEmail(e.target.value)
                      ? undefined
                      : 'Please enter a valid email address.',
                  );
                }}
              ></input>
            </FormEntry>
            <div className="flex text-xs flex-col items-start gap-3">
              <Checkbox
                className="text-xs"
                id="keepMeUpdatedCheckbox"
                disabled={!email}
                label="Keep me up to date on news and promotions."
                checked={keepMeUpdated}
                onCheckedChange={(checked) =>
                  setKeepMeUpdated(Boolean(checked.valueOf()))
                }
              />
              <Checkbox
                className="text-xs"
                id="acceptTermsCheckbox"
                label="I agree to the terms of service and the privacy policy."
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(Boolean(checked.valueOf()))
                }
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function PaymentOptionsForm({
  fundingSource = 'balance',
  paymentMethod = 'crypto',
  onFundingSourceChange,
  onPaymentMethodChange,
  onPaymentInformationChange,
  isInsufficientBalance,
  setIsValid,
  promoCode,
  setPromoCode,
}: {
  promoCode?: string;
  setPromoCode: (promoCode?: string) => Promise<void>;
  fundingSource?: FundFrom;
  paymentMethod?: PaymentMethod;
  onFundingSourceChange: (fundingSource: FundFrom) => void;
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void;
  onPaymentInformationChange: (paymentInformation: PaymentInformation) => void;
  isInsufficientBalance: boolean;
  setIsValid: (valid: boolean) => void;
}) {
  const [{ arioTicker }] = useGlobalState();
  const formattedARIOTicker = `${arioTicker}` as CryptoOptions;
  const cryptoDropdownOptions = useMemo(() => {
    return [{ label: formattedARIOTicker, value: formattedARIOTicker }];
  }, [arioTicker]);
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

  const { data: turboCreditBalanceRes } = useTurboCreditBalance();
  const turboCreditBalance = useMemo(() => {
    if (!turboCreditBalanceRes) return '0';
    const ar = new Ar();
    return formatARIOWithCommas(
      parseFloat(ar.winstonToAr(turboCreditBalanceRes.effectiveBalance)),
    );
  }, [turboCreditBalanceRes]);

  const [selectedCrypto, setSelectedCrypto] =
    useState<CryptoOptions>(formattedARIOTicker);

  const selectedCryptoBalance = useMemo(() => {
    if (selectedCrypto === formattedARIOTicker) {
      return allArIOBalance;
    }
    return 0;
  }, [selectedCrypto, allArIOBalance, formattedARIOTicker]);

  const [showTopupModal, setShowTopupModal] = useState(false);

  useEffect(() => {
    if (paymentMethod === 'credits' || paymentMethod === 'crypto') {
      setIsValid(!isInsufficientBalance);
    }
  }, [paymentMethod, isInsufficientBalance]);

  return (
    <>
      <div className="flex flex-col gap-6 w-full">
        {/* tabs */}
        <Tabs.Root
          className="w-full text-white flex flex-col h-full"
          value={paymentMethod}
          onValueChange={(value) =>
            onPaymentMethodChange(value as PaymentMethod)
          }
        >
          <Tabs.List
            defaultValue={'crypto'}
            className="flex w-full justify-center items-center gap-2 mb-6"
          >
            {/* TODO: add tooltip and disable trigger if purchase amount is greated or equal to 2000 USD */}
            <Tabs.Trigger
              value="card"
              className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-[#222224] data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex gap-3 items-center">
                <CreditCard className="size-5 text-grey" />
                Credit Card
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="crypto"
              className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-[#222224] data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap transition-all duration-300"
            >
              <ArIOTokenIcon className="size-5 text-grey fill-grey rounded-full border border-grey" />{' '}
              Crypto
            </Tabs.Trigger>
            <Tabs.Trigger
              value="credits"
              className="flex gap-3 p-3 data-[state=active]:bg-foreground rounded border border-[#222224] data-[state=active]:border-grey text-white items-center flex-1 whitespace-nowrap transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex gap-3 items-center">
                <TurboIcon
                  className="size-5 text-grey"
                  stroke="var(--text-grey)"
                />{' '}
                Credits
              </div>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            value="card"
            className={`flex flex-col data-[state=active]:p-6 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0 data-[state=inactive]:opacity-0 data-[state=active]:min-h-[405px]`}
          >
            <CardPanel
              setIsValid={paymentMethod === 'card' ? setIsValid : () => null}
              onPaymentInformationChange={onPaymentInformationChange}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
            />
          </Tabs.Content>
          <Tabs.Content
            value="crypto"
            className={`flex flex-col data-[state=active]:p-6 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0 data-[state=inactive]:opacity-0 data-[state=active]:min-h-[405px]`}
          >
            {' '}
            <SelectDropdown
              value={selectedCrypto}
              onChange={(value) => setSelectedCrypto(value as CryptoOptions)}
              renderValue={() => (
                <span className="text-white flex w-full">{selectedCrypto}</span>
              )}
              className={{
                trigger:
                  'flex w-full gap-2 p-3 rounded-md bg-transparent border border-[#222224] items-center pointer-events-none',
                icon: 'text-transparent size-5',
              }}
              options={cryptoDropdownOptions}
            />
            <div className="flex size-full mt-4">
              <div className="flex flex-col gap-2 items-start">
                <span className="text-grey text-xs">
                  Your total {selectedCrypto} balance:
                </span>
                <span className="text-white text-2xl font-bold">
                  {formatARIOWithCommas(selectedCryptoBalance)} {selectedCrypto}
                </span>
              </div>
            </div>
            {selectedCrypto === formattedARIOTicker && (
              <div className="flex flex-col gap-2 size-full items-start">
                <span className="text-grey text-xs">
                  Select balance method:
                </span>
                <Tabs.Root
                  defaultValue={fundingSource}
                  value={fundingSource}
                  className="flex flex-col w-full h-full"
                >
                  <Tabs.List
                    className="flex flex-col w-full gap-2 text-white text-sm"
                    defaultValue={'balance'}
                  >
                    <Tabs.Trigger
                      value="balance"
                      className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
                      onClick={() => onFundingSourceChange('balance')}
                    >
                      {fundingSource === 'balance' ? (
                        <CircleCheck className="size-5 text-background fill-white" />
                      ) : (
                        <Circle className="size-5 text-grey" />
                      )}
                      <span className="font-bold">Liquid Balance</span> (
                      {formatARIOWithCommas(liquidArIOBalance)} ARIO)
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="any"
                      className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
                      onClick={() => onFundingSourceChange('any')}
                    >
                      {fundingSource === 'any' ? (
                        <CircleCheck className="size-5 text-background fill-white" />
                      ) : (
                        <Circle className="size-5 text-grey" />
                      )}
                      <span className="font-bold">
                        Liquid + Staked Balances
                      </span>{' '}
                      ({formatARIOWithCommas(allArIOBalance)} ARIO)
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="stakes"
                      className="flex w-full gap-2 p-3 rounded bg-foreground data-[state=inactive]:bg-transparent border border-dark-grey items-center"
                      onClick={() => onFundingSourceChange('stakes')}
                    >
                      {fundingSource === 'stakes' ? (
                        <CircleCheck className="size-5 text-background fill-white" />
                      ) : (
                        <Circle className="size-5 text-grey" />
                      )}{' '}
                      <span className="font-bold">Staked Balances</span> (
                      {formatARIOWithCommas(stakedAndVaultedArIOBalance)} ARIO)
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs.Root>
              </div>
            )}
          </Tabs.Content>
          <Tabs.Content
            value="credits"
            className={`flex flex-col data-[state=active]:p-6 data-[state=active]:border border-dark-grey rounded h-full data-[state=inactive]:size-0 data-[state=inactive]:opacity-0 data-[state=active]:min-h-[405px]`}
          >
            <div className="flex w-full flex-col gap-2 items-start">
              <span className="text-grey text-sm">
                Your Turbo Credit balance:
              </span>
              <span className="text-white text-2xl font-bold">
                {turboCreditBalance} Credits
              </span>
            </div>{' '}
            {isInsufficientBalance && (
              <div className="flex size-full flex-col items-start justify-between">
                {' '}
                <div className="flex flex-col text-xs text-error items-start mt-6">
                  <span>Insufficient Turbo Credits for purchase.</span>
                  <span>
                    Please top-up to complete your purchase in credits.
                  </span>
                </div>
                <button
                  className="py-2 px-6 text-lg text-white rounded bg-dark-grey border border-transparent hover:border-grey"
                  onClick={() => setShowTopupModal(true)}
                >
                  Top-Up
                </button>
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>{' '}
      </div>
      {showTopupModal && (
        <TurboTopUpModal onClose={() => setShowTopupModal(false)} />
      )}
    </>
  );
}

export default PaymentOptionsForm;
