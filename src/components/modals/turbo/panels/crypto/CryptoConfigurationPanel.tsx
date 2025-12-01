import { TokenType } from '@ardrive/turbo-sdk';
import { useCryptoPrice } from '@src/hooks/useCryptoPrice';
import {
  formatNameAffordability,
  useNameAffordability,
} from '@src/hooks/useNameAffordability';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import useUploadCostGib from '@src/hooks/useUploadCostGib';
import { useWalletState } from '@src/state';
import { WALLET_TYPES } from '@src/types';
import {
  ARWEAVE_WALLET_TOKENS,
  CRYPTO_PRESETS,
  ETHEREUM_WALLET_TOKENS,
  TOKEN_DISPLAY_INFO,
  currencyLabels,
} from '@src/utils/constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const cryptoValueStringDefault = '0 = 0 credits ≈ 0 GiB';
export const cryptoValueStringError = 'Error: Unable to fetch credit estimate';

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

function CryptoConfigurationPanel({
  selectedToken,
  setSelectedToken,
  setTopupValue,
  valueString,
  setValueString,
  onNext,
  disableNext,
}: {
  selectedToken: TokenType;
  setSelectedToken: (token: TokenType) => void;
  setTopupValue: (topupValue: number | undefined) => void;
  valueString: string;
  setValueString: (valueString: string) => void;
  onNext: () => void;
  disableNext: boolean;
}) {
  useWalletState(); // Used for component re-render when wallet state changes
  const walletType = window.localStorage.getItem('walletType');
  const turbo = useTurboArNSClient();
  const { data: uploadCostGib } = useUploadCostGib();
  const { data: tokenUsdPrice } = useCryptoPrice(selectedToken);

  // Track the credits and storage to be received for the summary
  const [creditsToReceive, setCreditsToReceive] = useState<number>(0);
  const [storageToReceive, setStorageToReceive] = useState<number>(0);

  // Request ID to track valid async requests - incrementing invalidates pending requests
  const requestIdRef = useRef(0);

  // Get available tokens based on wallet type, organized into groups
  const { nativeTokens, stableTokens } = useMemo(() => {
    if (
      walletType === WALLET_TYPES.WANDER ||
      walletType === WALLET_TYPES.ARWEAVE_APP ||
      walletType === WALLET_TYPES.BEACON
    ) {
      // Arweave wallets only have native tokens (AR, ARIO)
      return { nativeTokens: ARWEAVE_WALLET_TOKENS, stableTokens: [] };
    }
    if (walletType === WALLET_TYPES.ETHEREUM) {
      // ETH wallets: group native tokens and stablecoins separately
      const native: typeof ETHEREUM_WALLET_TOKENS = [
        'ethereum',
        'base-eth',
        'pol',
        'ario',
      ];
      const stable: typeof ETHEREUM_WALLET_TOKENS = [
        'usdc',
        'base-usdc',
        'polygon-usdc',
      ];
      return { nativeTokens: native, stableTokens: stable };
    }
    return { nativeTokens: [], stableTokens: [] };
  }, [walletType]);

  // Get preset amounts for selected token
  const presetAmounts = useMemo(() => {
    return CRYPTO_PRESETS[selectedToken] || [1, 5, 10, 25];
  }, [selectedToken]);

  const [customValue, setCustomValue] = useState<string>();
  const [customValueError, setCustomValueError] = useState<string>();
  const [buttonSelected, setButtonSelected] = useState<number>();

  // Reset selection when token changes
  useEffect(() => {
    setButtonSelected(undefined);
    setCustomValue(undefined);
    setCustomValueError(undefined);
    setTopupValue(undefined);
    setValueString(cryptoValueStringDefault);
    setCreditsToReceive(0);
    setStorageToReceive(0);
  }, [selectedToken, setTopupValue, setValueString]);

  const updateValueString = useCallback(
    async ({
      wincPerGiB,
      tokenCost,
      tokenLabel,
      tokenType,
      requestId,
    }: {
      wincPerGiB: number;
      tokenCost: number;
      tokenLabel: string;
      tokenType: TokenType;
      requestId: number;
    }) => {
      if (!turbo?.turboUploader) {
        return;
      }

      if (tokenCost <= 0) {
        setValueString(`0 ${tokenLabel} = 0 credits ≈ 0 GB`);
        setCreditsToReceive(0);
        setStorageToReceive(0);
        return;
      }

      try {
        // Convert to atomic units before calling getWincForToken
        const atomicAmount = turbo.getAmountByTokenType(tokenCost, tokenType);
        if (!atomicAmount) {
          setValueString(cryptoValueStringError);
          setCreditsToReceive(0);
          setStorageToReceive(0);
          return;
        }

        const winc = await turbo.getWincForToken(+atomicAmount, tokenType);

        // Check if this request is still valid after async call (prevents race condition)
        // A newer request may have been made if user switched tokens or amounts
        if (requestId !== requestIdRef.current) {
          return;
        }

        const gibs = +winc.winc / wincPerGiB;
        const credits = turbo.wincToCredits(+winc.winc);

        setCreditsToReceive(credits);
        setStorageToReceive(gibs);
        setValueString(
          `${tokenCost} ${tokenLabel} = ${credits.toFixed(4)} credits ≈ ${formatStorage(gibs)}`,
        );
      } catch (e: unknown) {
        console.error(e);
        setValueString(cryptoValueStringError);
        setCreditsToReceive(0);
        setStorageToReceive(0);
      }
    },
    [turbo, setValueString],
  );

  // Update value string when amount changes
  useEffect(() => {
    // Increment request ID to invalidate any pending async requests
    const currentRequestId = ++requestIdRef.current;

    if (!uploadCostGib) {
      return;
    }

    // If no amount is selected, reset to defaults
    const numValue =
      buttonSelected !== undefined
        ? presetAmounts[buttonSelected]
        : customValue
          ? +customValue
          : 0;

    if (numValue !== undefined && !isNaN(numValue) && numValue > 0) {
      const tokenLabel = currencyLabels[selectedToken] || selectedToken;
      updateValueString({
        wincPerGiB: Number(uploadCostGib[0].winc),
        tokenCost: numValue,
        tokenLabel,
        tokenType: selectedToken,
        requestId: currentRequestId,
      });
      setTopupValue(numValue);
    } else {
      // Reset all values when no amount is selected
      setValueString(cryptoValueStringDefault);
      setTopupValue(undefined);
      setCreditsToReceive(0);
      setStorageToReceive(0);
    }
  }, [
    customValue,
    buttonSelected,
    uploadCostGib,
    presetAmounts,
    selectedToken,
    updateValueString,
    setTopupValue,
    setValueString,
  ]);

  const isValidCustomFormat = (val: string) => {
    return val.length === 0 || Number(val) >= 0;
  };

  const isValidCustomAmount = (val: string) => {
    return Number(val) <= 0
      ? 'Please enter a value greater than zero.'
      : undefined;
  };

  // Get the current amount being selected
  const currentAmount = useMemo(() => {
    if (buttonSelected !== undefined) {
      return presetAmounts[buttonSelected];
    }
    if (customValue) {
      return +customValue;
    }
    return 0;
  }, [buttonSelected, presetAmounts, customValue]);

  // Calculate USD value
  const usdValue = useMemo(() => {
    if (!tokenUsdPrice || currentAmount <= 0) return null;
    return currentAmount * tokenUsdPrice;
  }, [tokenUsdPrice, currentAmount]);

  // Calculate what names the user can afford with this USD amount
  const nameAffordability = useNameAffordability(usdValue ?? undefined);
  const nameAffordabilityText = formatNameAffordability(nameAffordability);

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        {/* Token Selection */}
        <div className="flex w-full flex-col gap-1 py-3 px-6">
          <div className="flex w-fit text-sm text-high items-center">
            Select Token
          </div>
          <div className="pt-1 flex flex-col gap-2">
            {/* Native tokens row - uses 12-column grid for precise control */}
            <div className="grid w-full grid-cols-12 gap-2">
              {nativeTokens.map((token) => {
                const tokenInfo = TOKEN_DISPLAY_INFO[token];
                const isSelected = selectedToken === token;
                // 4 tokens = 3 cols each, 2 tokens = 6 cols each
                const colSpan =
                  nativeTokens.length === 4 ? 'col-span-3' : 'col-span-6';
                return (
                  <button
                    key={token}
                    className={`${colSpan} rounded py-1.5 px-2 flex flex-col items-center justify-center min-h-[2.25rem] transition-all ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-dark-grey hover:bg-dark-grey/80'
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    <span className="text-xs font-semibold">
                      {tokenInfo?.name || token}
                    </span>
                    {tokenInfo?.network && (
                      <span
                        className={`text-[10px] ${isSelected ? 'text-black/60' : 'text-grey'}`}
                      >
                        {tokenInfo.network}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Stablecoins row - 3 tokens spanning full width (4 cols each) */}
            {stableTokens.length > 0 && (
              <div className="grid w-full grid-cols-12 gap-2">
                {stableTokens.map((token) => {
                  const tokenInfo = TOKEN_DISPLAY_INFO[token];
                  const isSelected = selectedToken === token;
                  return (
                    <button
                      key={token}
                      className={`col-span-4 rounded py-1.5 px-2 flex flex-col items-center justify-center min-h-[2.25rem] transition-all ${
                        isSelected
                          ? 'bg-white text-black'
                          : 'bg-dark-grey hover:bg-dark-grey/80'
                      }`}
                      onClick={() => setSelectedToken(token)}
                    >
                      <span className="text-xs font-semibold">
                        {tokenInfo?.name || token}
                      </span>
                      {tokenInfo?.network && (
                        <span
                          className={`text-[10px] ${isSelected ? 'text-black/60' : 'text-grey'}`}
                        >
                          {tokenInfo.network}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="flex w-full flex-col gap-1 py-3 px-6 border-t border-dark-grey">
          <div className="flex w-fit text-sm text-high items-center">
            Amount ({currencyLabels[selectedToken] || selectedToken})
          </div>
          <div className="pt-1 grid w-full grid-cols-4 gap-3">
            {presetAmounts.map((value, index) => (
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
                {value}
              </button>
            ))}
          </div>
          <div className="flex mt-4 text-sm text-grey whitespace-nowrap">
            Custom Amount
          </div>
          <div>
            <input
              type="text"
              className={`flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none whitespace-nowrap pl-4 py-2 pr-4`}
              value={customValue || ''}
              placeholder={`Enter ${currencyLabels[selectedToken] || selectedToken} amount`}
              onChange={(e) => {
                const val = e.target.value;

                if (isValidCustomFormat(val)) {
                  setCustomValue(val);
                  setButtonSelected(undefined);
                  setCustomValueError(isValidCustomAmount(val));
                }
              }}
            />
          </div>

          {customValueError && (
            <div className="text-sm text-error mt-1">{customValueError}</div>
          )}
        </div>

        {/* Receipt-style Summary */}
        <div className="flex w-full flex-col gap-2 py-3 px-6 border-t border-dark-grey">
          {valueString === cryptoValueStringError ? (
            <div className="text-sm text-error">{valueString}</div>
          ) : (
            <>
              <div className="flex flex-col text-sm">
                <div className="flex justify-between">
                  <span className="text-grey">You Pay:</span>
                  <span className="text-white">
                    {currentAmount > 0
                      ? `${currentAmount} ${currencyLabels[selectedToken] || selectedToken}`
                      : '-'}
                  </span>
                </div>
                {currentAmount > 0 && usdValue !== null && (
                  <div className="flex flex-col items-end text-grey text-xs mt-1">
                    <span>
                      ≈ $
                      {usdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
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

export default CryptoConfigurationPanel;
