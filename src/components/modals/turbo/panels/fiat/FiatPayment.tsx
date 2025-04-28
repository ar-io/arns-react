import { USD } from '@ardrive/turbo-sdk';
import Countdown from '@src/components/data-display/Countdown';
import { CircleXIcon, RefreshIcon } from '@src/components/icons';
import { Checkbox } from '@src/components/inputs/Checkbox';
import { SelectDropdown } from '@src/components/inputs/Select';
import useCountries from '@src/hooks/useCountries';
import { useEstimatedCreditsForUSD } from '@src/hooks/useEstimatedCreditsForUSD';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import {
  PaymentInformation,
  TurboArNSClient,
} from '@src/services/turbo/TurboArNSClient';
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeCardElementOptions } from '@stripe/stripe-js';
import { PaymentIntent } from '@stripe/stripe-js';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { isEmail } from 'validator';

import { valueStringError } from '../../TurboTopUpModal';

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
      {errorText && (
        <div className="flex text-xs text-error whitespace-nowrap">
          {errorText}
        </div>
      )}
    </div>
  );
};

const isValidPromoCode = async (
  paymentAmount: number,
  promoCode: string,
  destinationAddress: string,
  turbo: TurboArNSClient,
) => {
  try {
    const response = await turbo.turboUploader.getWincForFiat({
      amount: USD(paymentAmount / 100),
      promoCodes: [promoCode],
      nativeAddress: destinationAddress,
    });
    return response.adjustments.length > 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return false;
  }
};

function FiatPayment({
  promoCode,
  setPromoCode,
  paymentAmount,
  setPaymentIntent,
  setPaymentInformation,
  onBack,
  onSubmit,
}: {
  promoCode?: string;
  setPromoCode: (promoCode?: string) => void;
  paymentAmount?: number;
  setPaymentIntent: (paymentIntent?: PaymentIntent) => void;
  setPaymentInformation: (paymentInformation: PaymentInformation) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: countries } = useCountries();
  const turbo = useTurboArNSClient();

  const stripe = useStripe();
  const elements = useElements();

  const [localPromoCode, setLocalPromoCode] = useState<string>();
  const [promoCodeError, setPromoCodeError] = useState<string>();

  const [name, setName] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [keepMeUpdated, setKeepMeUpdated] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string>();
  const [cardError, setCardError] = useState<string>();
  const [countryError, setCountryError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();

  const [paymentMethodError, setPaymentMethodError] = useState<string>();

  const {
    data: estimatedCredits,
    dataUpdatedAt: creditsEstimateUpdatedAt,
    isLoading: isLoadingCreditsEstimate,
    isRefetching: isRefetchingCreditsEstimate,
  } = useEstimatedCreditsForUSD({
    paymentAmount,
    promoCode,
  });

  const [countdownEndTimestamp, setCountdownEndTimestamp] = useState<number>(
    Date.now() + 5 * 60 * 1000,
  );

  useEffect(() => {
    setCountdownEndTimestamp(creditsEstimateUpdatedAt + 5 * 60 * 1000);
  }, [creditsEstimateUpdatedAt]);

  const isValid = useMemo(
    () =>
      name &&
      estimatedCredits &&
      !cardError &&
      country &&
      (!email || isEmail(email)),
    [name, estimatedCredits, cardError, country, email],
  );

  const cardElementOptions: StripeCardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'white',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
    hidePostalCode: true,
  };

  const actualPaymentAmount = estimatedCredits
    ? (estimatedCredits.actualPaymentAmount / 100).toFixed(2)
    : 0;

  const adjustment =
    estimatedCredits?.adjustments && estimatedCredits.adjustments.length > 0
      ? estimatedCredits.adjustments[0]
      : undefined;

  const discountAmount = adjustment
    ? `(${100 - adjustment.operatorMagnitude * 100}% discount applied)`
    : undefined;

  return (
    <div className="flex flex-col">
      <div>
        <div className="flex font-bold px-6 whitespace-nowrap">
          Payment Details
        </div>
      </div>

      <div className="flex w-full flex-col px-6 pt-4">
        <div className="grid grid-cols-2">
          {estimatedCredits ? (
            <div className="flex flex-col">
              <div className="flex text-xl font-bold whitespace-nowrap">
                {turbo
                  ?.wincToCredits(Number(estimatedCredits?.winc ?? 0))
                  .toFixed(4)}{' '}
                Credits
              </div>
              <div className="flex text-sm whitespace-nowrap gap-1">
                ${actualPaymentAmount}{' '}
                {discountAmount && (
                  <span className="flex  text-grey">{discountAmount}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex text-sm font-bold text-error whitespace-nowrap">
              {valueStringError}
            </div>
          )}
          <div className="flex flex-col gap-2 items-center bg-foreground px-4 justify-center py-2 text-center text-sm  text-grey">
            <div
              className={`flex flex-row w-full justify-center items-center gap-2 flex-nowrap whitespace-nowrap ${
                countdownEndTimestamp < Date.now() && 'animate-pulse'
              }`}
            >
              Quote Updates in{' '}
              {isLoadingCreditsEstimate ||
              isRefetchingCreditsEstimate ||
              countdownEndTimestamp < Date.now() ? (
                `Loading...`
              ) : (
                <Countdown endTimestamp={countdownEndTimestamp} />
              )}
            </div>
            <button
              className="flex items-center gap-1 text-grey fill-grey hover:text-white hover:fill-white transition-all whitespace-nowrap"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ['estimatedCredits'],
                  refetchType: 'all',
                });
                setCountdownEndTimestamp(Date.now() + 5 * 60 * 1000);
              }}
            >
              <RefreshIcon className="size-5" /> Refresh
            </button>
          </div>
        </div>

        <form className="mt-2 flex  flex-col gap-4">
          <FormEntry name="name" label="Name on Card *" errorText={nameError}>
            <input
              className="size-full flex  bg-transparent px-4 py-2 outline-none "
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
              className="size-full bg-transparent px-4 py-2 outline-none whitespace-nowrap h-[2.188rem]"
              onChange={(e) => {
                setCardError(e.error?.message);
              }}
            />
          </FormEntry>
          <FormEntry name="country" label="Country *" errorText={countryError}>
            <SelectDropdown
              position="item-aligned"
              value={country}
              onChange={(value) => {
                setCountry(value);
                setCountryError(!value ? 'Country is required' : undefined);
              }}
              className={{
                trigger:
                  'bg-transparent text-white flex gap-2 items-center p-2 rounded outline-none justify-between h-fit w-full ',
                item: 'flex items-center w-full gap-3 cursor-pointer bg-background hover:bg-foreground p-2 text-grey fill-grey hover:fill-white  hover:text-white outline-none  transition-all',
                content:
                  'bg-background z-[100] rounded  border py-2 w-full border-foreground box-border',
                group: 'flex flex-col  bg-foreground text-sm w-full',
                viewport: 'justify-center items-center w-[428px]',
                icon: 'text-grey size-5',
              }}
              renderValue={(v) => (
                <span className="text-white pl-2 w-full items-start flex">
                  {v}
                </span>
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
          </FormEntry>
          {promoCode ? (
            <div className="flex flex-col gap-1">
              <span className="flex text-sm text-grey whitespace-nowrap">
                Promo Code{' '}
                <span className="text-success font-bold">{promoCode}</span>
              </span>
              <div className="flex max-w-fit items-center gap-2 text-sm text-grey whitespace-nowrap">
                Promo code successfully applied.
                <button
                  className="text-white flex w-fit"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (walletAddress && wallet && paymentAmount && turbo) {
                      try {
                        // reset payment intent to one without promo code
                        const newPaymentIntent =
                          await turbo.getTopupPaymentIntent({
                            address: walletAddress.toString(),
                            amount: paymentAmount,
                            token: wallet.tokenType,
                          });
                        setPaymentIntent(newPaymentIntent.paymentSession);
                        setPromoCode(undefined);
                        setLocalPromoCode(undefined);
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
                  <CircleXIcon className="size-5 fill-success text-success" />
                </button>
              </div>
              {promoCodeError && (
                <div className="text-xs text-error whitespace-nowrap">
                  {promoCodeError}
                </div>
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
                  className="peer flex size-full bg-transparent px-4 py-2 outline-none"
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
                      paymentAmount &&
                      walletAddress &&
                      localPromoCode &&
                      localPromoCode.length > 0
                    ) {
                      if (
                        turbo &&
                        (await isValidPromoCode(
                          paymentAmount,
                          localPromoCode,
                          walletAddress.toString(),
                          turbo,
                        )) &&
                        wallet &&
                        wallet.tokenType &&
                        turbo
                      ) {
                        try {
                          const newPaymentIntent =
                            await turbo.getTopupPaymentIntent({
                              address: walletAddress.toString(),
                              amount: paymentAmount,
                              token: wallet.tokenType,
                              promoCode: localPromoCode,
                            });
                          setPaymentIntent(newPaymentIntent.paymentSession);
                          setPromoCode(localPromoCode);
                        } catch (e: unknown) {
                          console.error(e);
                          setPromoCodeError(
                            'Error applying promo code, please try again.',
                          );
                        }
                      } else {
                        setLocalPromoCode(undefined);
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

          <div className="pt-1">
            <FormEntry
              name="email"
              label="Please leave an email if you want a receipt."
              errorText={emailError}
            >
              <input
                type="text"
                className="flex size-full bg-transparent px-4 py-2 outline-none"
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
                  if (keepMeUpdated) {
                    setKeepMeUpdated(isEmail(newEmail));
                  }
                }}
              ></input>
            </FormEntry>

            <div className="mt-4 flex items-center">
              <Checkbox
                className="text-xs whitespace-nowrap size-4"
                id="keepMeUpdatedCheckbox"
                disabled={!email}
                label={
                  <span className="text-sm whitespace-nowrap">
                    Keep me up to date on news and promotions.
                  </span>
                }
                checked={keepMeUpdated}
                onCheckedChange={(checked) =>
                  setKeepMeUpdated(Boolean(checked.valueOf()))
                }
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex gap-2 w-full justify-end border-t border-dark-grey py-3 mt-4 px-6">
        {' '}
        {paymentMethodError && (
          <div className="mt-2 w-full text-right text-sm text-error">
            {paymentMethodError}
          </div>
        )}
        <button
          className="text-grey hover:text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          Back
        </button>
        <button
          disabled={!isValid}
          className="text-black border border-dark-grey bg-primary px-4 py-2 rounded disabled:opacity-50"
          onClick={async () => {
            const cardElement = elements?.getElement(CardElement);

            if (name && country && cardElement && stripe) {
              const { paymentMethod, error } = await stripe.createPaymentMethod(
                {
                  type: 'card',
                  card: cardElement,
                  billing_details: {
                    name,
                    email: keepMeUpdated ? email : undefined,
                  },
                },
              );

              if (error) {
                eventEmitter.emit('error', error);
                setPaymentMethodError(error.message);
              } else if (paymentMethod) {
                setPaymentInformation({
                  paymentMethodId: paymentMethod.id,
                  email,
                });
                onSubmit();
              }
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FiatPayment;
