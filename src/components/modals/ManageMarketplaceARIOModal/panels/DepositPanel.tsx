import {
  AOProcess,
  ARIOToken,
  AoARIOWrite,
  ArNSMarketplaceWrite,
  createAoSigner,
} from '@ar.io/sdk';
import { Loader } from '@src/components/layout';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useMarketplaceUserAssets } from '@src/hooks/useMarketplaceUserAssets';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas, sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { useCallback, useEffect, useState } from 'react';
import { isNumeric } from 'validator';

const MIN_ARIO_DEPOSIT = 1;
const MAX_ARIO_DEPOSIT = 1000000;
const ARIO_PRESET_VALUES = [100, 1000, 10000, 100000];
const POLLING_INTERVAL = 5000; // 5 seconds

interface DepositPanelProps {
  onClose: () => void;
}

function DepositPanel({ onClose }: DepositPanelProps) {
  const [
    {
      arioTicker,
      arioContract,
      aoClient,
      marketplaceContract,
      marketplaceProcessId,
    },
  ] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: arIoPrice } = useArIoPrice();
  const { data: marketplaceAssets, refetch: refetchMarketplaceAssets } =
    useMarketplaceUserAssets({
      address: walletAddress?.toString(),
    });

  const [customValue, setCustomValue] = useState<string>('');
  const [customValueError, setCustomValueError] = useState<string>('');
  const [buttonSelected, setButtonSelected] = useState<number | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [expectedBalance, setExpectedBalance] = useState<number | null>(null);

  // Get current marketplace balance
  const currentBalance = marketplaceAssets?.balances?.balance
    ? Number(marketplaceAssets.balances.balance) / 1000000
    : 0;

  // Validation functions
  const isValidCustomFormat = useCallback((value: string): boolean => {
    if (value === '') return true;
    return isNumeric(value) && !value.includes('-') && !value.includes('+');
  }, []);

  const isValidCustomAmount = useCallback(
    (value: string): string | undefined => {
      const numValue = Number(value);
      if (numValue < MIN_ARIO_DEPOSIT) {
        return `Minimum deposit is ${MIN_ARIO_DEPOSIT} ${arioTicker}`;
      }
      if (numValue > MAX_ARIO_DEPOSIT) {
        return `Maximum deposit is ${formatARIOWithCommas(MAX_ARIO_DEPOSIT)} ${arioTicker}`;
      }
      return undefined;
    },
    [arioTicker],
  );

  // Get current deposit amount
  const currentDepositAmount = useCallback((): number => {
    if (buttonSelected !== undefined) {
      return ARIO_PRESET_VALUES[buttonSelected];
    }
    if (customValue) {
      return Number(customValue);
    }
    return 0;
  }, [buttonSelected, customValue]);

  // Format USD value
  const formatUsdValue = useCallback(
    (arIOAmount: number): string => {
      if (!arIoPrice || arIOAmount === 0) return '';
      const usdValue = arIOAmount * arIoPrice;
      return `≈ $${usdValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USD`;
    },
    [arIoPrice],
  );

  // Polling for balance verification
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling && pollCount < 12 && expectedBalance !== null) {
      // Poll for up to 1 minute (12 * 5 seconds)
      intervalId = setInterval(async () => {
        try {
          const result = await refetchMarketplaceAssets();
          const updatedBalance = result.data?.balances?.balance
            ? Number(result.data.balances.balance) / 1000000
            : 0;

          // Check if balance has reached the expected amount
          if (updatedBalance >= expectedBalance) {
            setIsPolling(false);
            setPollCount(0);
            setExpectedBalance(null);
            eventEmitter.emit('success', {
              name: 'Deposit Verified',
              message: 'Deposit has been confirmed on the blockchain',
            });
          } else {
            setPollCount((prev) => prev + 1);
          }
        } catch (error) {
          console.error('Error polling marketplace balance:', error);
          setPollCount((prev) => prev + 1);
        }
      }, POLLING_INTERVAL);
    } else if (pollCount >= 12) {
      setIsPolling(false);
      setPollCount(0);
      setExpectedBalance(null);
      eventEmitter.emit('warning', {
        name: 'Deposit Verification Timeout',
        message:
          'Deposit may still be processing. Please check your balance later.',
      });
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, pollCount, expectedBalance, refetchMarketplaceAssets]);

  const handleDeposit = async () => {
    if (!wallet?.contractSigner || !walletAddress || !marketplaceContract) {
      setError('Wallet not connected or marketplace not available');
      return;
    }

    const depositAmount = currentDepositAmount();

    if (depositAmount < MIN_ARIO_DEPOSIT) {
      setError(`Minimum deposit is ${MIN_ARIO_DEPOSIT} ${arioTicker}`);
      return;
    }

    if (customValue && customValueError) {
      setError(customValueError);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Convert to mARIO tokens (multiply by 1000000 for 6 decimal places)
      const amountInMARIO = new ARIOToken(depositAmount).toMARIO();
      const writeMarketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as AoARIOWrite,
      });

      await writeMarketplaceContract.depositArIO({
        amount: amountInMARIO.valueOf().toString(),
      });

      // Wait a bit for cranking to complete
      await sleep(3000);

      // Start polling for balance verification with expected balance
      setExpectedBalance(currentBalance + depositAmount);
      setIsPolling(true);
      setPollCount(0);

      // Invalidate queries immediately
      queryClient.refetchQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('marketplace-user-assets') &&
          queryKey.includes(walletAddress.toString()),
      });

      eventEmitter.emit('success', {
        name: 'Deposit Submitted',
        message: `Deposited ${depositAmount} ${arioTicker} to Marketplace. Verifying...`,
      });

      // Reset form
      setCustomValue('');
      setCustomValueError('');
      setButtonSelected(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
      eventEmitter.emit('error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const newBalance = currentBalance + currentDepositAmount();

  return (
    <div className="flex flex-col gap-2 w-full min-w-[400px] px-6">
      {/* Current Balance Display */}
      <div className="flex w-full flex-col gap-2 py-3 px-6 bg-dark-grey/30 rounded-lg mt-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-grey">Current Balance:</span>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">
              {formatARIOWithCommas(currentBalance)} {arioTicker}
            </span>
            {arIoPrice && currentBalance > 0 && (
              <span className="text-xs text-grey">
                {formatUsdValue(currentBalance)}
              </span>
            )}
          </div>
        </div>
        {isPolling && expectedBalance && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Loader size={12} />
            <span>
              Verifying deposit... ({pollCount}/12) - Expecting{' '}
              {formatARIOWithCommas(expectedBalance)} {arioTicker}
            </span>
          </div>
        )}
      </div>

      {/* Amount Selection */}
      <div className="flex w-full flex-col gap-1 py-3">
        <div className="flex w-fit text-sm text-white items-center">
          Deposit Amount ({arioTicker})
        </div>
        <div className="pt-1 grid w-full grid-cols-4 gap-3">
          {ARIO_PRESET_VALUES.map((value, index) => (
            <button
              key={index}
              className={`rounded p-2.5 flex flex-col items-center gap-1 ${
                buttonSelected === index
                  ? 'bg-white text-black'
                  : 'bg-dark-grey text-white hover:bg-gray-600 transition-colors'
              }`}
              onClick={() => {
                setCustomValue(value.toString());
                setButtonSelected(index);
                setCustomValueError('');
                setError('');
              }}
              disabled={isLoading}
            >
              <span className="font-medium">{formatARIOWithCommas(value)}</span>
              {arIoPrice && (
                <span
                  className={`text-xs ${
                    buttonSelected === index ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {formatUsdValue(value)}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex mt-4 text-sm text-grey whitespace-nowrap">
          Custom Amount (min {MIN_ARIO_DEPOSIT} - max{' '}
          {formatARIOWithCommas(MAX_ARIO_DEPOSIT)} {arioTicker})
        </div>
        <div className="relative">
          <input
            type="text"
            className="flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none whitespace-nowrap pl-4 py-2 pr-4 text-white focus:border-primary"
            value={customValue || ''}
            placeholder="Enter amount"
            disabled={isLoading}
            onChange={(e) => {
              const val = e.target.value;

              if (isValidCustomFormat(val)) {
                const numVal = Number(val);
                const clampedVal = Math.min(numVal, MAX_ARIO_DEPOSIT);
                setCustomValue(clampedVal.toString());
                setButtonSelected(undefined);
                setCustomValueError(
                  isValidCustomAmount(clampedVal.toString()) || '',
                );
                setError('');
              }
            }}
          />
          {/* USD conversion for custom input */}
          {customValue && Number(customValue) > 0 && arIoPrice && (
            <div className="text-xs text-white mt-1">
              {formatUsdValue(Number(customValue))}
            </div>
          )}
        </div>

        {/* Custom Value Error */}
        {customValueError && (
          <div className="text-error text-sm mt-1">{customValueError}</div>
        )}
      </div>

      {/* Before/After Balance Display */}
      {currentDepositAmount() > 0 && (
        <div className="flex w-full flex-col gap-2 py-3 px-6 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-grey">After Deposit:</span>
            <div className="flex flex-col items-end">
              <span className="text-white font-medium">
                {formatARIOWithCommas(newBalance)} {arioTicker}
              </span>
              {arIoPrice && (
                <span className="text-xs text-grey">
                  {formatUsdValue(newBalance)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="flex flex-col gap-2 py-2">
        <ul className="text-xs text-white space-y-1 list-disc list-inside">
          <li>
            Deposited {arioTicker} will be available for marketplace
            transactions
          </li>
          <li>You can withdraw your deposit at any time</li>
          <li>
            Minimum deposit: {MIN_ARIO_DEPOSIT} {arioTicker}
          </li>
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-5 gap-3">
          <Loader size={24} />
          <span className="text-sm text-grey">Processing deposit...</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 pb-6">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-dark-grey text-white rounded hover:bg-dark-grey transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleDeposit}
          disabled={
            currentDepositAmount() < MIN_ARIO_DEPOSIT ||
            !!customValueError ||
            isLoading
          }
          className="flex-1 px-4 py-2 bg-primary text-black rounded hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  );
}

export default DepositPanel;
