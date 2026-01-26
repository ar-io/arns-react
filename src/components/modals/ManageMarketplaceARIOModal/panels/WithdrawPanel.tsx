import {
  AOProcess,
  ARIOToken,
  AoARIOWrite,
  ArNSMarketplaceWrite,
  createAoSigner,
} from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import { Loader } from '@src/components/layout';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useMarketplaceUserAssets } from '@src/hooks/useMarketplaceUserAssets';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas, sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { useCallback, useEffect, useState } from 'react';
import { isNumeric } from 'validator';

const MIN_ARIO_WITHDRAW = 0.000001; // 1 mARIO
const WITHDRAW_PRESET_PERCENTAGES = [25, 50, 75, 100];

interface WithdrawPanelProps {
  onClose: () => void;
}

function WithdrawPanel({ onClose }: WithdrawPanelProps) {
  const [
    {
      arioTicker,
      arioContract,
      marketplaceContract,
      marketplaceProcessId,
      aoClient,
    },
  ] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const { data: arIoPrice } = useArIoPrice();
  const { data: marketplaceAssets } = useMarketplaceUserAssets({
    address: walletAddress?.toString(),
  });

  const [customValue, setCustomValue] = useState<string>('');
  const [customValueError, setCustomValueError] = useState<string>('');
  const [percentageSelected, setPercentageSelected] = useState<
    number | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Get current marketplace balance (liquid balance only, not locked)
  const currentBalance = marketplaceAssets?.balances?.balance
    ? Number(marketplaceAssets.balances.balance) / 1000000
    : 0;

  const lockedBalance = marketplaceAssets?.balances?.lockedBalance
    ? Number(marketplaceAssets.balances.lockedBalance) / 1000000
    : 0;

  // Validation functions
  const isValidCustomFormat = useCallback((value: string): boolean => {
    if (value === '') return true;
    return isNumeric(value) && !value.includes('-') && !value.includes('+');
  }, []);

  const isValidCustomAmount = useCallback(
    (value: string): string | undefined => {
      const numValue = Number(value);
      if (numValue < MIN_ARIO_WITHDRAW) {
        return `Minimum withdrawal is ${MIN_ARIO_WITHDRAW} ${arioTicker}`;
      }
      if (numValue > currentBalance) {
        return `Cannot withdraw more than available balance (${formatARIOWithCommas(currentBalance)} ${arioTicker})`;
      }
      return undefined;
    },
    [arioTicker, currentBalance],
  );

  // Get current withdrawal amount
  const currentWithdrawAmount = useCallback((): number => {
    if (percentageSelected !== undefined) {
      return (
        (currentBalance * WITHDRAW_PRESET_PERCENTAGES[percentageSelected]) / 100
      );
    }
    if (customValue) {
      return Number(customValue);
    }
    return 0;
  }, [percentageSelected, customValue, currentBalance]);

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

  const handleWithdraw = async () => {
    if (!wallet?.contractSigner || !walletAddress || !marketplaceContract) {
      setError('Wallet not connected or marketplace not available');
      return;
    }

    const withdrawAmount = currentWithdrawAmount();

    if (withdrawAmount < MIN_ARIO_WITHDRAW) {
      setError(`Minimum withdrawal is ${MIN_ARIO_WITHDRAW} ${arioTicker}`);
      return;
    }

    if (withdrawAmount > currentBalance) {
      setError(
        `Cannot withdraw more than available balance (${formatARIOWithCommas(currentBalance)} ${arioTicker})`,
      );
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
      const amountInMARIO = new ARIOToken(withdrawAmount).toMARIO();
      const writeMarketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as AoARIOWrite,
      });

      await writeMarketplaceContract.withdrawArIO({
        amount: amountInMARIO.valueOf().toString(),
      });

      // Wait a bit for cranking to complete
      await sleep(3000);

      // Invalidate queries immediately
      queryClient.refetchQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('marketplace-user-assets') &&
          queryKey.includes(walletAddress.toString()),
      });

      eventEmitter.emit('success', {
        name: 'Withdraw from Marketplace',
        message: `Withdrew ${withdrawAmount} ${arioTicker} from Marketplace. This may take a few minutes to return to your wallet.`,
      });

      // Reset form
      setCustomValue('');
      setCustomValueError('');
      setPercentageSelected(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
      eventEmitter.emit('error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const newBalance = currentBalance - currentWithdrawAmount();

  return (
    <div className="flex flex-col gap-2 w-full min-w-[400px] px-6">
      {/* Current Balance Display */}
      <div className="flex w-full flex-col gap-2 py-3 px-6 bg-dark-grey/30 rounded-lg mt-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-grey">Available Balance:</span>
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
        {lockedBalance > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-grey">Locked Balance:</span>
            <div className="flex flex-col items-end">
              <span className="text-orange-400 font-medium">
                {formatARIOWithCommas(lockedBalance)} {arioTicker}
              </span>
              {arIoPrice && (
                <span className="text-xs text-grey">
                  {formatUsdValue(lockedBalance)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Amount Selection */}
      <div className="flex w-full flex-col gap-1 py-3">
        <div className="flex w-fit text-sm text-white items-center">
          Withdrawal Amount ({arioTicker})
        </div>
        <div className="pt-1 grid w-full grid-cols-4 gap-3">
          {WITHDRAW_PRESET_PERCENTAGES.map((percentage, index) => {
            const amount = (currentBalance * percentage) / 100;
            return (
              <button
                key={index}
                className={`rounded p-2.5 flex flex-col items-center gap-1 ${
                  percentageSelected === index
                    ? 'bg-white text-black'
                    : 'bg-dark-grey text-white hover:bg-gray-600 transition-colors'
                } ${currentBalance === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (currentBalance === 0) return;
                  setCustomValue(amount.toFixed(6));
                  setPercentageSelected(index);
                  setCustomValueError('');
                  setError('');
                }}
                disabled={isLoading || currentBalance === 0}
              >
                <span className="font-medium">{percentage}%</span>
                <span
                  className={`text-xs ${
                    percentageSelected === index
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}
                >
                  {formatARIOWithCommas(amount)}
                </span>
                {arIoPrice && amount > 0 && (
                  <span
                    className={`text-xs ${
                      percentageSelected === index
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatUsdValue(amount)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex mt-4 text-sm text-grey whitespace-nowrap">
          Custom Amount (min {MIN_ARIO_WITHDRAW} - max{' '}
          {formatARIOWithCommas(currentBalance)} {arioTicker})
        </div>
        <div className="relative">
          <input
            type="text"
            className="flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none whitespace-nowrap pl-4 py-2 pr-4 text-white focus:border-primary"
            value={customValue || ''}
            placeholder="Enter amount"
            disabled={isLoading || currentBalance === 0}
            onChange={(e) => {
              const val = e.target.value;

              if (isValidCustomFormat(val)) {
                const numVal = Number(val);
                const clampedVal = Math.min(numVal, currentBalance);
                setCustomValue(clampedVal.toString());
                setPercentageSelected(undefined);
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
      {currentWithdrawAmount() > 0 && (
        <div className="flex w-full flex-col gap-2 py-3 px-6 bg-orange-500/10 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-grey">After Withdrawal:</span>
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
            You can only withdraw from your available balance, not locked funds
          </li>
          <li>Locked balance is tied to active marketplace orders</li>
          <li>
            Minimum withdrawal: {MIN_ARIO_WITHDRAW} {arioTicker}
          </li>
          <li>Withdrawn {arioTicker} will be returned to your wallet</li>
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded">
          {error}
        </div>
      )}

      {/* No Balance Warning */}
      {currentBalance === 0 && (
        <div className="text-orange-400 text-sm p-3 bg-orange-900/20 border border-orange-500/30 rounded">
          No available balance to withdraw. Deposit {arioTicker} first or wait
          for locked funds to become available.
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-5 gap-3">
          <Loader size={24} />
          <span className="text-sm text-grey">Processing withdrawal...</span>
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
          onClick={handleWithdraw}
          disabled={
            currentWithdrawAmount() < MIN_ARIO_WITHDRAW ||
            currentWithdrawAmount() > currentBalance ||
            !!customValueError ||
            isLoading ||
            currentBalance === 0
          }
          className="flex-1 px-4 py-2 bg-primary text-black rounded hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
}

export default WithdrawPanel;
