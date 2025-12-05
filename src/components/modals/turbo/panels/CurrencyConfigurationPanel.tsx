import { USD } from '@ardrive/turbo-sdk';
import {
  formatNameAffordability,
  useNameAffordability,
} from '@src/hooks/useNameAffordability';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import useUploadCostGib from '@src/hooks/useUploadCostGib';
import { useWalletState } from '@src/state';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isNumeric } from 'validator';

const MAX_FIAT_TOPUP = 2000;
const MIN_FIAT_TOPUP = 5;

const valueStringError = 'Error: Unable to fetch credit estimate';

const FIAT_BUTTON_VALUES = [5, 25, 50, 100];

// Format storage with appropriate units (GiB, MiB, or KiB)
function formatStorage(gibs: number): string {
  if (gibs >= 1) {
    return `${gibs.toFixed(2)} GiB`;
  } else if (gibs >= 0.001) {
    const mibs = gibs * 1024;
    return `${mibs.toFixed(2)} MiB`;
  } else if (gibs > 0) {
    const kibs = gibs * 1024 * 1024;
    return `${kibs.toFixed(0)} KiB`;
  }
  return '0 GiB';
}

function CurrencyConfigurationPanel({
  setTopupValue,
  valueString,
  setValueString,
  paymentIntentError,
  onNext,
  disableNext,
}: {
  setTopupValue: (topupValue: number | undefined) => void;
  valueString: string;
  setValueString: (valueString: string) => void;
  paymentIntentError: string | undefined;
  onNext: () => void;
  disableNext: boolean;
}) {
  const [{ walletAddress }] = useWalletState();

  const turbo = useTurboArNSClient();
  const { data: uploadCostGib } = useUploadCostGib();

  // Track the credits and storage to be received for the summary
  const [creditsToReceive, setCreditsToReceive] = useState<number>(0);
  const [storageToReceive, setStorageToReceive] = useState<number>(0);

  const [customValue, setCustomValue] = useState<string>();
  const [customValueError, setCustomValueError] = useState<string>();
  const [buttonSelected, setButtonSelected] = useState<number>();

  const updateValueString = useCallback(
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

      if (fiatCost < MIN_FIAT_TOPUP) {
        setCreditsToReceive(0);
        setStorageToReceive(0);
        return;
      }

      try {
        const winc = await turbo.turboUploader.getWincForFiat({
          amount: USD(+fiatCost.toFixed(2)),
        });
        const gibs = +winc.winc / wincPerGiB;
        const credits = turbo.wincToCredits(+winc.winc);

        setCreditsToReceive(credits);
        setStorageToReceive(gibs);
        setValueString(
          `$${fiatCost.toFixed(2)} = ${credits.toFixed(4)} credits ≈ ${formatStorage(gibs)}`,
        );
      } catch (e: unknown) {
        console.error(e);
        setValueString(valueStringError);
        setCreditsToReceive(0);
        setStorageToReceive(0);
      }
    },
    [walletAddress, turbo, setValueString],
  );

  // Update value string when amount changes
  useEffect(() => {
    if (!uploadCostGib || !walletAddress) {
      return;
    }

    const numValue =
      buttonSelected !== undefined
        ? FIAT_BUTTON_VALUES[buttonSelected]
        : customValue
          ? +customValue
          : 0;

    if (
      numValue !== undefined &&
      !isNaN(numValue) &&
      numValue >= MIN_FIAT_TOPUP
    ) {
      updateValueString({
        fiatCost: numValue,
        wincPerGiB: Number(uploadCostGib[0].winc),
      });
      setTopupValue(numValue);
    } else {
      setValueString('$0.00 = 0 credits ≈ 0 GiB');
      setTopupValue(undefined);
      setCreditsToReceive(0);
      setStorageToReceive(0);
    }
  }, [
    customValue,
    buttonSelected,
    uploadCostGib,
    walletAddress,
    updateValueString,
    setTopupValue,
    setValueString,
  ]);

  const isValidCustomFormat = (val: string) => {
    return val.length === 0 || isNumeric(val, { no_symbols: true });
  };

  const isValidCustomAmount = (val: string) => {
    return (val.length > 0 && Number(val) < MIN_FIAT_TOPUP) ||
      Number(val) > MAX_FIAT_TOPUP
      ? `Please enter an amount between $${MIN_FIAT_TOPUP} and $${MAX_FIAT_TOPUP}`
      : undefined;
  };

  // Get the current amount being selected
  const currentAmount = useMemo(() => {
    if (buttonSelected !== undefined) {
      return FIAT_BUTTON_VALUES[buttonSelected];
    }
    if (customValue) {
      return +customValue;
    }
    return 0;
  }, [buttonSelected, customValue]);

  // Calculate what names the user can afford with this USD amount
  const nameAffordability = useNameAffordability(
    currentAmount > 0 ? currentAmount : undefined,
  );
  const nameAffordabilityText = formatNameAffordability(nameAffordability);

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        {/* Amount Selection */}
        <div className="flex w-full flex-col gap-1 py-3 px-6">
          <div className="flex w-fit text-sm text-high items-center">
            Amount (USD)
          </div>
          <div className="pt-1 grid w-full grid-cols-4 gap-3">
            {FIAT_BUTTON_VALUES.map((value, index) => (
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
                ${value}
              </button>
            ))}
          </div>
          <div className="flex mt-4 text-sm text-grey whitespace-nowrap">
            Custom Amount (min $5 - max $2,000)
          </div>
          <div>
            <input
              type="text"
              className="flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none whitespace-nowrap pl-8 py-2 pr-4"
              value={customValue || ''}
              placeholder="Enter amount"
              onChange={(e) => {
                const val = e.target.value;

                if (isValidCustomFormat(val)) {
                  const numVal = Number(val);
                  const clampedVal = Math.min(numVal, MAX_FIAT_TOPUP);
                  setCustomValue(clampedVal.toString());
                  setButtonSelected(undefined);
                  setCustomValueError(
                    isValidCustomAmount(clampedVal.toString()),
                  );
                }
              }}
            />
            <div className="flex pointer-events-none relative bottom-[2.125rem] pl-4">
              $
            </div>
          </div>

          {customValueError && (
            <div className="text-sm text-error -mt-4">{customValueError}</div>
          )}
        </div>

        {/* Receipt-style Summary */}
        <div className="flex w-full flex-col gap-2 py-3 px-6 border-t border-dark-grey">
          {valueString === valueStringError ? (
            <div className="text-sm text-error">{valueString}</div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-grey">You Pay:</span>
                <span className="text-white">
                  {currentAmount >= MIN_FIAT_TOPUP
                    ? `$${currentAmount.toFixed(2)}`
                    : '-'}
                </span>
              </div>
              <div className="flex flex-col text-sm">
                <div className="flex justify-between">
                  <span className="text-grey">Credits:</span>
                  <span className="text-white">
                    {creditsToReceive > 0
                      ? `+${creditsToReceive.toFixed(4)}`
                      : '-'}
                  </span>
                </div>
                {creditsToReceive > 0 && (
                  <div className="flex flex-col items-end text-grey text-xs mt-1 gap-0.5">
                    <span>≈ {formatStorage(storageToReceive)} storage</span>
                    {nameAffordabilityText && (
                      <span>≈ {nameAffordabilityText}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {paymentIntentError && (
        <div className="flex w-full text-right justify-center text-sm text-error">
          {paymentIntentError}
        </div>
      )}

      <div className="flex gap-2 w-full justify-end border-t border-dark-grey py-3 mt-2 px-6">
        <button
          disabled={disableNext}
          className="text-black border border-dark-grey bg-primary px-4 py-2 rounded disabled:opacity-50"
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default CurrencyConfigurationPanel;
