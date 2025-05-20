import { TokenType, USD } from '@ardrive/turbo-sdk';
import { SelectDropdown } from '@src/components/inputs/Select';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { useTurboCreditBalance } from '@src/hooks/useTurboCreditBalance';
import useUploadCostGib from '@src/hooks/useUploadCostGib';
import { useWalletState } from '@src/state';
import { formatARIOWithCommas } from '@src/utils/common/common';
import { currencyLabels } from '@src/utils/constants';
import Ar from 'arweave/node/ar';
import { ChevronDownIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isNumeric } from 'validator';

import { PanelStates } from '../TurboTopUpModal';

const MAX_FIAT_TOPUP = 2000;
const MIN_FIAT_TOPUP = 5;

const valueStringDefault = '$0 = 0 credits \u{02248} 0 GB';
const valueStringError = `Error: Unable to fetch credit estimate`;

type Currency = 'fiat' | 'crypto';

const BUTTON_VALUES: Partial<Record<TokenType | 'fiat', number[]>> = {
  fiat: [5, 25, 50, 100],
  arweave: [0.5, 1, 5, 10],
  ethereum: [0.01, 0.05, 0.1, 0.25],
  solana: [0.05, 0.1, 0.25, 0.5],
  kyve: [0, 0, 0, 0],
  pol: [0, 0, 0, 0],
  matic: [0, 0, 0, 0],
};

function CurrencyConfigurationPanel({
  currency,
  setCurrency,
  setTopupValue,
  valueString,
  setValueString,
  paymentIntentError,
  // setPanelState,
  onNext,
  disableNext,
}: {
  currency: Currency | 'fiat';
  setCurrency: (currency: Currency | 'fiat') => void;
  setTopupValue: (topupValue: number | undefined) => void;
  valueString: string;
  setValueString: (valueString: string) => void;
  paymentIntentError: string | undefined;
  setPanelState: (panelState: PanelStates) => void;
  onNext: () => void;
  disableNext: boolean;
}) {
  const [{ wallet, walletAddress }] = useWalletState();

  const turbo = useTurboArNSClient();
  const { data: uploadCostGib } = useUploadCostGib();

  const { data: turboCreditBalanceRes } = useTurboCreditBalance();
  const creditsBalance = useMemo(() => {
    if (!turboCreditBalanceRes) return '0';
    const ar = new Ar();
    return formatARIOWithCommas(
      parseFloat(ar.winstonToAr(turboCreditBalanceRes.effectiveBalance)),
    );
  }, [turboCreditBalanceRes]);

  const buttonValues: number[] =
    currency === 'fiat' || !wallet?.tokenType
      ? (BUTTON_VALUES.fiat as number[])
      : (BUTTON_VALUES[wallet.tokenType as TokenType] as number[]);

  const [customValue, setCustomValue] = useState<string>();
  const [customValueError, setCustomValueError] = useState<string>();
  const [buttonSelected, setButtonSelected] = useState<number>();

  const updateValueStringFiat = useCallback(
    async ({
      fiatCost,
      wincPerGiB,
    }: {
      fiatCost: number;
      wincPerGiB: number;
    }) => {
      if (!turbo?.turboUploader || !walletAddress) {
        return;
      }

      try {
        const winc = await turbo.turboUploader.getWincForFiat({
          amount: USD(+fiatCost.toFixed(2)),
        });
        const gibs = +winc.winc / wincPerGiB;

        setValueString(
          `$${fiatCost.toFixed(2)} = ${turbo
            .wincToCredits(+winc.winc)
            .toFixed(4)} credits \u{02248} ${gibs.toFixed(2)} GiB`,
        );
      } catch (e: unknown) {
        console.error(e);
        setValueString(valueStringError);
      }
    },
    [walletAddress, turbo?.turboUploader],
  );

  const updateValueStringCrypto = useCallback(
    async ({
      wincPerGiB,
      tokenCost,
      tokenLabel,
      tokenType,
    }: {
      wincPerGiB: number;
      tokenCost: number;
      tokenLabel: string;
      tokenType: TokenType;
    }) => {
      if (!turbo?.turboUploader || !walletAddress) {
        return;
      }

      if (tokenCost <= 0) {
        setValueString(`0 ${tokenLabel} = 0 credits \u{02248} 0 GB`);
        return;
      }

      const cryptoAmount = turbo.getAmountByTokenType(tokenCost, tokenType);
      try {
        const winc = await turbo.getWincForToken(
          cryptoAmount ? +cryptoAmount : 0,
          tokenType,
        );
        const gibs = +winc.winc / wincPerGiB;

        setValueString(
          `${tokenCost} ${tokenLabel} = ${turbo
            .wincToCredits(+winc.winc)
            .toFixed(4)} credits \u{02248} ${gibs.toFixed(2)} GiB`,
        );
      } catch (e: unknown) {
        console.error(e);
        setValueString(valueStringError);
      }
    },
    [turbo?.turboUploader],
  );

  useEffect(() => {
    if (!uploadCostGib || !walletAddress) {
      return;
    }

    const numValue =
      buttonSelected !== undefined
        ? buttonValues[buttonSelected]
        : customValue
        ? +customValue
        : 0;

    if (
      numValue !== undefined &&
      !isNaN(numValue) &&
      (currency == 'crypto' || numValue >= 5)
    ) {
      setTopupValue(numValue);
    } else {
      if (!wallet) {
        return;
      }
      setValueString(
        `${
          currency == 'crypto'
            ? `0 ${currencyLabels[wallet.tokenType]} \u{02248} `
            : ''
        }${valueStringDefault}`,
      );
      setTopupValue(undefined);
    }
  }, [
    customValue,
    buttonSelected,
    uploadCostGib,
    buttonValues,
    currency,
    wallet,
    updateValueStringFiat,
    updateValueStringCrypto,
  ]);

  useEffect(() => {
    if (!uploadCostGib || !walletAddress) {
      return;
    }

    const numValue =
      buttonSelected !== undefined
        ? buttonValues[buttonSelected]
        : customValue
        ? +customValue
        : 0;

    if (
      numValue !== undefined &&
      !isNaN(numValue) &&
      (currency == 'crypto' || numValue >= 5)
    ) {
      if (currency == 'fiat') {
        const fiatCost = numValue;
        updateValueStringFiat({
          fiatCost,
          wincPerGiB: Number(uploadCostGib[0].winc),
        });
      } else {
        if (!wallet) {
          return;
        }
        updateValueStringCrypto({
          wincPerGiB: Number(uploadCostGib[0].winc),
          tokenCost: numValue,
          tokenLabel: currencyLabels[wallet.tokenType]!,
          tokenType: wallet.tokenType,
        });
      }
      setTopupValue(numValue);
    } else {
      if (!wallet) {
        return;
      }
      setValueString(
        `${
          currency == 'crypto'
            ? `0 ${currencyLabels[wallet.tokenType]} \u{02248} `
            : ''
        }${valueStringDefault}`,
      );
      setTopupValue(undefined);
    }
  }, [
    customValue,
    buttonSelected,
    uploadCostGib,
    buttonValues,
    currency,
    wallet,
    updateValueStringFiat,
    updateValueStringCrypto,
  ]);

  const isValidCustomFormat = (val: string) => {
    if (currency == 'fiat') {
      return val.length == 0 || isNumeric(val, { no_symbols: true });
    }
    return val.length == 0 || Number(val) >= 0;
  };

  const isValidCustomAmount = (val: string) => {
    if (currency == 'fiat') {
      return (val.length > 0 && Number(val) < MIN_FIAT_TOPUP) ||
        Number(val) > MAX_FIAT_TOPUP
        ? `Please enter an amount between $${MIN_FIAT_TOPUP} and $${MAX_FIAT_TOPUP}`
        : undefined;
    }
    return Number(val) <= 0
      ? 'Please enter a value greater than zero.'
      : undefined;
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col items-start border-b border-dark-grey py-3 px-6">
          <div className="font-bold whitespace-nowrap">Your Balance</div>
          <div className="text-2xl text-grey whitespace-nowrap">
            {creditsBalance ?? '0'} Credits
          </div>
        </div>
        <div className="flex w-full flex-col gap-1 py-3 px-6">
          <div className="flex w-fit gap-4 text-sm text-high items-center relative">
            <div>Amount</div>
            {wallet?.contractSigner && (
              <SelectDropdown
                side={'bottom'}
                position="popper"
                renderValue={() => {
                  return currency === 'fiat'
                    ? 'USD'
                    : currencyLabels[wallet.tokenType];
                }}
                triggerIcon={<ChevronDownIcon className="size-4" />}
                className={{
                  trigger:
                    'text-white flex gap-2 items-center px-3 rounded-lg outline-none justify-between h-fit w-fit text-sm',
                  item: 'flex items-center text-sm gap-3 cursor-pointer hover:bg-dark-grey text-grey hover:text-white px-3 py-2 outline-none transition-all',
                  content:
                    'flex bg-background z-[100] rounded overflow-hidden border border-dark-grey w-[6rem]',
                }}
                options={[
                  {
                    label: 'USD',
                    value: 'fiat',
                  },
                  // {
                  //   label: currencyLabels[wallet.tokenType],
                  //   value: 'crypto',
                  // },
                ]}
                value={currency}
                onChange={(e) => {
                  setCurrency(e as Currency);
                }}
              />
            )}
          </div>
          <div className="pt-1 grid w-full grid-cols-4 gap-3">
            {buttonValues.map((value, index) => (
              <button
                key={index}
                className={`rounded p-2.5 ${
                  buttonSelected === index
                    ? 'bg-white text-black'
                    : 'bg-dark-grey'
                }`}
                onClick={() => {
                  setCustomValue(undefined);
                  setButtonSelected(index);
                  setCustomValueError(undefined);
                }}
              >
                {currency == 'fiat' && '$'}
                {value}
              </button>
            ))}
          </div>
          <div className="flex mt-5 text-sm text-grey whitespace-nowrap">
            Custom Amount {currency == 'fiat' && `(min $5 - max $2,000)`}
          </div>
          <div>
            <input
              type="text"
              className={`flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none whitespace-nowrap ${
                currency == 'fiat' ? 'pl-8' : 'pl-4'
              } py-2 pr-4`}
              value={customValue || ''}
              onChange={(e) => {
                const val = e.target.value;

                if (isValidCustomFormat(val)) {
                  const numVal = Number(val);
                  const clampedVal =
                    currency == 'fiat'
                      ? Math.min(numVal, MAX_FIAT_TOPUP)
                      : numVal;
                  setCustomValue(clampedVal.toString());
                  setButtonSelected(undefined);

                  setCustomValueError(
                    isValidCustomAmount(clampedVal.toString()),
                  );
                }
              }}
            ></input>

            <div
              className={`flex pointer-events-none relative bottom-[2.125rem] pl-4 ${
                currency !== 'fiat' && 'text-transparent'
              }`}
            >
              $
            </div>
          </div>

          <div
            className={`flex pointer-events-none relative bottom-[1.125rem] text-sm whitespace-nowrap ${
              customValueError ? 'text-error' : 'text-transparent'
            }`}
          >
            {/* we do this to prevent layout shift */}
            {customValueError ?? 'no error'}
          </div>

          <div
            className={`flex font-semibold whitespace-nowrap ${
              valueString === valueStringError ? 'text-error' : 'text-white'
            }`}
          >
            {valueString}
          </div>
        </div>
      </div>{' '}
      {paymentIntentError && (
        <div className="flex w-full text-right justify-center text-sm text-error">
          {paymentIntentError}
        </div>
      )}
      <div className="flex gap-2 w-full justify-end border-t border-dark-grey py-3 mt-4 px-6">
        {/* {wallet?.submitNativeTransaction && (
          <div className="flex whitespace-nowrap">
            <button
              className="text-sm whitespace-nowrap"
              onClick={() => setPanelState('resume-eth-topup')}
            >
              Resume {currencyLabels[wallet.tokenType]} Topup
            </button>
          </div>
        )}{' '} */}
        <div className="flex gap-2 w-full justify-end">
          {' '}
          <button
            disabled={disableNext}
            className="text-black border border-dark-grey bg-primary px-4 py-2 rounded disabled:opacity-50"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default CurrencyConfigurationPanel;
