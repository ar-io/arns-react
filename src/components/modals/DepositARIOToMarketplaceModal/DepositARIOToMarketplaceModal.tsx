import {
  AOProcess,
  ARIOToken,
  AoARIOWrite,
  ArNSMarketplaceWrite,
  createAoSigner,
  mARIOToken,
} from '@ar.io/sdk';
import { Loader } from '@src/components/layout';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas, sleep } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { useCallback, useState } from 'react';
import { isNumeric } from 'validator';
import DialogModal from '../DialogModal/DialogModal';

const MIN_ARIO_DEPOSIT = 1;
const MAX_ARIO_DEPOSIT = 1000000;

const ARIO_PRESET_VALUES = [100, 1000, 10000, 100000];

interface DepositARIOToMarketplaceModalProps {
  show: boolean;
  onClose: () => void;
}

function DepositARIOToMarketplaceModal({
  show,
  onClose,
}: DepositARIOToMarketplaceModalProps) {
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

  const [customValue, setCustomValue] = useState<string>('');
  const [customValueError, setCustomValueError] = useState<string>('');
  const [buttonSelected, setButtonSelected] = useState<number | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

      queryClient.refetchQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('marketplace-user-assets') &&
          queryKey.includes(walletAddress.toString()),
      });

      eventEmitter.emit('success', {
        name: 'Deposit to Marketplace',
        message: `Deposited ${depositAmount} ${arioTicker} to Marketplace`,
      });

      // Close modal on success
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
      eventEmitter.emit('error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setCustomValue('');
      setCustomValueError('');
      setButtonSelected(undefined);
      setError('');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="modal-container">
      <DialogModal
        title={
          <h2 className="text-white text-xl">
            Deposit {arioTicker} to Marketplace
          </h2>
        }
        body={
          <div className="flex flex-col gap-2 w-full min-w-[400px]">
            {/* Amount Selection */}
            <div className="flex w-full flex-col gap-1 py-3 px-6">
              <div className="flex w-fit text-sm text-white items-center">
                Amount ({arioTicker})
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
                    <span className="font-medium">
                      {formatARIOWithCommas(value)}
                    </span>
                    {arIoPrice && (
                      <span
                        className={`text-xs ${
                          buttonSelected === index
                            ? 'text-gray-600'
                            : 'text-gray-400'
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
                <div className="text-error text-sm mt-1">
                  {customValueError}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col gap-2 px-6 py-2">
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
              <div className="text-red-400 text-sm p-3 mx-6 bg-red-900/20 border border-red-500/30 rounded">
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
          </div>
        }
        onCancel={handleCancel}
        onClose={handleCancel}
        nextText={isLoading ? 'Processing...' : 'Deposit'}
        cancelText="Cancel"
        onNext={
          currentDepositAmount() >= MIN_ARIO_DEPOSIT &&
          !customValueError &&
          !isLoading
            ? handleDeposit
            : undefined
        }
        footer={
          <div className="flex flex-col text-xs text-grey gap-1">
            {currentDepositAmount() > 0 && (
              <div className="flex flex-col gap-1">
                <div>
                  Depositing: {formatARIOWithCommas(currentDepositAmount())}{' '}
                  {arioTicker}
                </div>
                {arIoPrice && (
                  <div className="text-gray-400">
                    {formatUsdValue(currentDepositAmount())}
                  </div>
                )}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

export default DepositARIOToMarketplaceModal;
