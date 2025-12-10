import { Tooltip } from '@src/components/data-display';
import { InfoIcon } from '@src/components/icons';
import DateTimePicker from '@src/components/inputs/DateTimePicker/DateTimePicker';
import { useArNSDomainPriceList } from '@src/hooks/useArNSDomainPriceList';
import { formatARIOWithCommas } from '@src/utils';
import { useCallback, useEffect, useState } from 'react';
import { isNumeric } from 'validator';

const MIN_LISTING_PRICE = 1;
const MAX_LISTING_PRICE = 1000000;

const PRICE_BUTTON_VALUES = [10000, 50000, 100000, 1000000];

interface FixedPricePanelProps {
  domainName: string;
  antId?: string;
  listingPrice: number;
  setListingPrice: (price: number) => void;
  arIoPrice?: number;
  arioTicker: string;
  expirationDate?: Date;
  setExpirationDate: (date: Date | undefined) => void;
  onNext: () => void;
  disableNext: boolean;
}

function FixedPricePanel({
  domainName,
  listingPrice,
  setListingPrice,
  arIoPrice,
  arioTicker,
  expirationDate,
  setExpirationDate,
  onNext,
  disableNext,
}: FixedPricePanelProps) {
  const { data: domainPrices, isLoading: isPricesLoading } =
    useArNSDomainPriceList(domainName);

  const [customValue, setCustomValue] = useState<string>('');
  const [customValueError, setCustomValueError] = useState<string>('');
  const [buttonSelected, setButtonSelected] = useState<number | undefined>(
    undefined,
  );

  // Set initial price based on market value when data loads
  useEffect(() => {
    if (domainPrices && !listingPrice && domainPrices.buy > 0) {
      const marketPrice = Math.ceil(domainPrices.buy / 1000000); // Convert from mARIO to ARIO
      setListingPrice(marketPrice);
      setCustomValue(marketPrice.toString());
    }
  }, [domainPrices, listingPrice, setListingPrice]);

  // Sync customValue with listingPrice when coming back from confirm screen
  useEffect(() => {
    if (listingPrice > 0) {
      setCustomValue(listingPrice.toString());
      // Check if the current price matches any preset button
      const matchingButton = PRICE_BUTTON_VALUES.find(
        (value) => value === listingPrice,
      );
      setButtonSelected(matchingButton);
    }
  }, [listingPrice]);

  const isValidCustomFormat = useCallback((value: string): boolean => {
    if (value === '') return true;
    return isNumeric(value) && !value.includes('e') && !value.includes('E');
  }, []);

  const isValidCustomAmount = useCallback(
    (value: string): string => {
      const numValue = Number(value);
      if (numValue < MIN_LISTING_PRICE) {
        return `Minimum listing price is ${MIN_LISTING_PRICE} ${arioTicker}`;
      }
      if (numValue > MAX_LISTING_PRICE) {
        return `Maximum listing price is ${formatARIOWithCommas(MAX_LISTING_PRICE)} ${arioTicker}`;
      }
      return '';
    },
    [arioTicker],
  );

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

  const marketPriceDisplay = domainPrices?.buy
    ? `Market Value: ${formatARIOWithCommas(Math.ceil(domainPrices.buy / 1000000))} ${arioTicker}`
    : '';

  return (
    <div className="flex flex-col p-6 gap-6">
      {/* Market Value Display */}
      {marketPriceDisplay && !isPricesLoading && (
        <div className="flex items-center justify-between p-3 bg-dark-grey rounded border border-grey">
          <span className="text-sm text-grey">Current Market Value</span>
          <span className="text-white font-medium">
            {formatARIOWithCommas(Math.ceil(domainPrices!.buy / 1000000))}{' '}
            {arioTicker}
            {arIoPrice && (
              <span className="text-xs text-grey ml-2">
                {formatUsdValue(Math.ceil(domainPrices!.buy / 1000000))}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Price Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-medium">
            Amount ({arioTicker})
          </label>

          {/* Preset Price Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {PRICE_BUTTON_VALUES.map((value, index) => (
              <button
                key={index}
                className={`rounded p-2.5 transition-colors ${
                  buttonSelected === index
                    ? 'bg-white text-black'
                    : 'bg-dark-grey text-white hover:bg-gray-600'
                }`}
                onClick={() => {
                  setCustomValue(value.toString());
                  setListingPrice(value);
                  setButtonSelected(index);
                  setCustomValueError('');
                }}
              >
                <span className="font-bold text-base">
                  {formatARIOWithCommas(value)}
                </span>
                {arIoPrice && (
                  <div
                    className={`text-xs ${
                      buttonSelected === index
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {formatUsdValue(value)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Price Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-grey">
            Custom Price (min {MIN_LISTING_PRICE} - max{' '}
            {formatARIOWithCommas(MAX_LISTING_PRICE)} {arioTicker})
          </label>
          <div className="relative">
            <input
              type="text"
              className="flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none whitespace-nowrap pl-20 py-2 pr-4 text-white
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              value={customValue}
              placeholder={`Enter ${arioTicker} amount`}
              onChange={(e) => {
                const val = e.target.value;
                if (isValidCustomFormat(val)) {
                  const numVal = Number(val);
                  const clampedVal = Math.min(numVal, MAX_LISTING_PRICE);
                  setCustomValue(clampedVal.toString());
                  setListingPrice(clampedVal);
                  setButtonSelected(undefined);
                  setCustomValueError(
                    isValidCustomAmount(clampedVal.toString()),
                  );
                }
              }}
            />
            <div className="pointer-events-none absolute bottom-0 left-0 flex h-full items-center pl-4 text-white">
              {arioTicker}
            </div>
          </div>

          {/* Custom Value Error */}
          {customValueError && (
            <div className="text-error text-sm">{customValueError}</div>
          )}

          {/* USD Conversion for Custom Input */}
          {customValue &&
            isNumeric(customValue) &&
            Number(customValue) > 0 &&
            arIoPrice && (
              <div className="text-white text-sm">
                {formatUsdValue(Number(customValue))}
              </div>
            )}
        </div>
      </div>

      {/* Listing Duration */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <label className="text-white text-sm font-medium">
              Listing Expiration
            </label>
            <Tooltip
              message="Dates and times are based on your local timezone and use the 24-hour time system (e.g., 14:30 for 2:30 PM)"
              icon={
                <InfoIcon
                  style={{
                    fontSize: '14px',
                    fill: 'var(--text-grey)',
                    width: '14px',
                    cursor: 'pointer',
                  }}
                />
              }
              tooltipOverrides={{
                overlayInnerStyle: {
                  padding: '12px',
                  maxWidth: '280px',
                },
              }}
            />
          </div>
          <DateTimePicker
            value={expirationDate}
            onChange={setExpirationDate}
            placeholder="Select expiration date and time"
            minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Minimum 1 day from now
            className="w-full"
          />
          <span className="text-xs text-grey">
            Your listing will automatically expire at the selected date and time
            (max 30 days)
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          className="flex-1 bg-transparent border border-dark-grey text-white px-6 py-3 rounded hover:bg-grey hover:bg-opacity-20 transition-colors"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          className={`flex-1 px-6 py-3 rounded transition-colors ${
            disableNext || customValueError
              ? 'bg-grey text-white cursor-not-allowed'
              : 'bg-primary text-black hover:bg-primary-dark'
          }`}
          onClick={onNext}
          disabled={disableNext || !!customValueError}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default FixedPricePanel;
