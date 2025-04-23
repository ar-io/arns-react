import { FundFrom, mARIOToken } from '@ar.io/sdk';
import { USD } from '@ardrive/turbo-sdk';
import { ArIOTokenIcon, TurboIcon } from '@src/components/icons';
import { Checkbox } from '@src/components/inputs/Checkbox';
import { SelectDropdown } from '@src/components/inputs/Select';
import TurboTopUpModal from '@src/components/modals/turbo/TurboTopUpModal';
import {
  useArIOLiquidBalance,
  useArIOStakedAndVaultedBalance,
} from '@src/hooks/useArIOBalance';
import useCountries from '@src/hooks/useCountries';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { useTurboCreditBalance } from '@src/hooks/useTurboCreditBalance';
import {
  getPaymentIntent,
  getWincForFiat,
  wincToCredits,
} from '@src/services/turbo/paymentService';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas, isArweaveTransactionID } from '@src/utils';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { PaymentIntent, StripeCardElementOptions } from '@stripe/stripe-js';
import Ar from 'arweave/node/ar';
import { Circle, CircleCheck, CircleXIcon, CreditCard } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isEmail } from 'validator';

export type PaymentMethod = 'card' | 'crypto' | 'credits';
export type ARIOCryptoOptions = '$ARIO' | '$dARIO' | '$tARIO';
export type CryptoOptions = ARIOCryptoOptions;

const FormEntry: FC<{
  name: string;
  label: string;
  children: ReactNode;
  errorText?: string;
}> = ({
  name,
  label,
  children,
  errorText,
}: {
  name: string;
  children: ReactNode;
  label: string;
  errorText?: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-grey" htmlFor={name}>
        {label}
      </label>
      <div className="w-full rounded border border-foreground">{children}</div>
      {errorText && <div className="text-xs text-error">{errorText}</div>}
    </div>
  );
};

function CardPanel({
  setIsValid,
  paymentAmount,
}: {
  setIsValid: (valid: boolean) => void;
  paymentAmount: number;
}) {
  const [{ walletAddress }] = useWalletState();
  const { data: countries } = useCountries();
  const turbo = useTurboArNSClient();
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [keepMeUpdated, setKeepMeUpdated] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string>();
  const [cardError, setCardError] = useState<string>();
  const [countryError, setCountryError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [promoCode, setPromoCode] = useState<string>();
  const [promoCodeError, setPromoCodeError] = useState<string>();
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>();

  useEffect(() => {
    if (
      nameError ||
      cardError ||
      countryError ||
      emailError ||
      promoCodeError
    ) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [nameError, cardError, countryError, emailError, promoCodeError]);

  const cardElementOptions: StripeCardElementOptions = {
    style: {
      base: {
        color: 'white',
        '::placeholder': {
          color: '#7d7d85',
        },
      },
    },
    hidePostalCode: true,
  };

  const isValidPromoCode = async (
    paymentAmount: number,
    promoCode: string,
    destinationAddress: string,
  ) => {
    try {
      const response = await getWincForFiat({
        amount: USD(paymentAmount / 100),
        promoCode,
        destinationAddress,
      });
      return response.adjustments.length > 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      return false;
    }
  };

  return (
    <div className="flex size-full flex-col items-start text-left">
      <div className="flex w-full flex-col text-grey">
        <form className="flex  flex-col gap-3">
          <FormEntry name="name" label="Name on Card *" errorText={nameError}>
            <input
              className="size-full bg-transparent p-3 text-white"
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
          <FormEntry name="name" label="Credit Card *" errorText={cardError}>
            <CardElement
              options={cardElementOptions}
              className="w-full bg-transparent p-3 text-white"
              onChange={(e) => {
                setCardError(e.error?.message);
              }}
            />
          </FormEntry>
          <FormEntry name="name" label="Country *" errorText={countryError}>
            <SelectDropdown
              position="item-aligned"
              value={country}
              onChange={(value) => {
                setCountry(value);
                setCountryError(!value ? 'Country is required' : undefined);
              }}
              className={{
                trigger:
                  'bg-transparent text-white flex gap-2 items-center p-3 rounded outline-none justify-between h-fit w-full text-sm',
                item: 'w-[24rem] flex items-center gap-3 cursor-pointer bg-background hover:bg-foreground px-3 py-3 text-grey fill-grey hover:fill-white  hover:text-white outline-none  transition-all',
                content:
                  'flex bg-background z-[100] rounded overflow-hidden border py-2 w-[24rem] border-foreground absolute left-[-2.5rem]',
                group: 'flex flex-col  bg-foreground text-sm',
                viewport: 'flex pr-1 justify-start',
                icon: 'text-grey size-5',
              }}
              renderValue={(v) => (
                <span className="text-white  w-full items-start flex">{v}</span>
              )}
              options={
                countries?.map(
                  (c) =>
                    ({
                      label: c,
                      value: c,
                    } as any),
                ) ?? []
              }
            />
            {/* <select
              className="mr-2 w-full bg-transparent p-3 text-sm text-grey "
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCountryError(
                  !e.target.value ? 'Country is required' : undefined,
                );
              }}
            >
              <option value="">Select Country</option>
              {countries?.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select> */}
          </FormEntry>{' '}
          {promoCode ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm text-fg-disabled" htmlFor="promoCode">
                Promo Code
              </label>
              <div className="flex flex-row items-center gap-1 text-sm text-fg-disabled text-green-500">
                Promo code successfully applied.
                <button
                  className="text-white"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (walletAddress && paymentAmount) {
                      try {
                        // reset payment intent to one without promo code
                        const newPaymentIntent = await getPaymentIntent(
                          walletAddress.toString(),
                          paymentAmount,
                          isArweaveTransactionID(walletAddress.toString())
                            ? 'arweave'
                            : 'ethereum',
                        );
                        setPaymentIntent(newPaymentIntent.paymentSession);
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
                  <CircleXIcon className="size-5 text-green-500" />
                </button>
              </div>
              {promoCodeError && (
                <div className="text-xs text-error">{promoCodeError}</div>
              )}
            </div>
          ) : (
            <FormEntry
              name="name"
              label="Promo Code"
              errorText={promoCodeError}
            >
              <div className="relative">
                <input
                  className="peer size-full bg-transparent p-3"
                  type="text"
                  name="promoCode"
                  value={promoCode || ''}
                  onChange={(e) => {
                    const v = e.target.value ?? '';
                    const cleaned = v.replace(/[^a-zA-Z0-9\s]/g, '');
                    setPromoCode(cleaned);
                    setPromoCodeError(undefined);
                  }}
                ></input>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-white opacity-0 transition-opacity focus:opacity-100 peer-focus:opacity-100"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      paymentAmount &&
                      walletAddress &&
                      promoCode &&
                      promoCode.length > 0
                    ) {
                      if (
                        await isValidPromoCode(
                          paymentAmount,
                          promoCode,
                          walletAddress.toString(),
                        )
                      ) {
                        try {
                          const newPaymentIntent = await getPaymentIntent(
                            walletAddress.toString(),
                            paymentAmount,
                            isArweaveTransactionID(walletAddress.toString())
                              ? 'arweave'
                              : 'ethereum',
                            promoCode,
                          );
                          setPaymentIntent(newPaymentIntent.paymentSession);
                          setPromoCode(promoCode);
                        } catch (e: unknown) {
                          console.error(e);
                          setPromoCodeError(
                            'Error applying promo code, please try again.',
                          );
                        }
                      } else {
                        setPromoCode(undefined);
                        setPromoCodeError('Promo code is invalid or expired.');
                      }
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            </FormEntry>
          )}
          <div className="flex size-full flex-col gap-3">
            <FormEntry
              name="email"
              label="Enter email for a receipt."
              errorText={emailError}
            >
              <input
                type="text"
                className="w-full bg-transparent p-3"
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
  isInsufficientBalance,
  setIsValid,
}: {
  fundingSource?: FundFrom;
  paymentMethod?: PaymentMethod;
  onFundingSourceChange: (fundingSource: FundFrom) => void;
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void;
  isInsufficientBalance: boolean;
  setIsValid: (valid: boolean) => void;
}) {
  const [{ arioTicker }] = useGlobalState();
  const formattedARIOTicker = `$${arioTicker}` as CryptoOptions;
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
              <Tooltip
                tooltipOverrides={{
                  arrow: false,
                  overlayInnerStyle: {
                    whiteSpace: 'nowrap',
                    width: 'fit-content',
                    padding: '0.625rem',
                    border: '1px solid var(--text-faded)',
                  },
                }}
                message="Coming Soon!"
                icon={
                  <div className="flex gap-3 items-center">
                    <CreditCard className="size-5 text-grey" />
                    Credit Card
                  </div>
                }
              />
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
            <CardPanel setIsValid={setIsValid} paymentAmount={0} />
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
