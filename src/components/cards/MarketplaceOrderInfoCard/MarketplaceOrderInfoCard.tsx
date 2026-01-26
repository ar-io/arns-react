import ANTDetailsTip from '@src/components/Tooltips/ANTDetailsTip';
import { Tooltip } from '@src/components/data-display';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import { ArNSLogo } from '@src/components/icons';
import { Checkbox } from '@src/components/inputs/Checkbox';
import useDomainInfo from '@src/hooks/useDomainInfo';
import {
  decodeDomainToASCII,
  formatVerboseDate,
  isArweaveTransactionID,
} from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import { DEFAULT_ANT_LOGO } from '@src/utils/constants';
import { ReactNode } from 'react';

export interface MarketplaceOrderConfig {
  listingType: 'fixed' | 'dutch' | 'english';
  price: number;
  arioTicker: string;
  arIoPrice?: number;
  expirationDate?: Date;
  startingPrice?: number; // For dutch auctions
  reservePrice?: number; // For english auctions
  decrementInterval?: number; // For dutch auctions (hours)
  decrementAmount?: number; // For dutch auctions
}

interface MarketplaceOrderInfoCardProps {
  config: MarketplaceOrderConfig;
  name?: string;
  className?: string;
}

function MarketplaceOrderInfoCard({
  config,
  name,
  className = '',
}: MarketplaceOrderInfoCardProps) {
  const {
    listingType,
    price,
    arioTicker,
    arIoPrice,
    expirationDate,
    startingPrice,
    reservePrice,
    decrementInterval,
    decrementAmount,
  } = config;

  const { data: domainInfo } = useDomainInfo({
    domain: name,
  });

  const formatUsdValue = (arIOAmount: number): string => {
    if (!arIoPrice || arIOAmount === 0) return '';
    const usdValue = arIOAmount * arIoPrice;
    return `≈ $${usdValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} USD`;
  };

  const getListingTypeLabel = () => {
    switch (listingType) {
      case 'fixed':
        return 'Fixed Price';
      case 'dutch':
        return 'Dutch Auction';
      case 'english':
        return 'English Auction';
      default:
        return 'Unknown';
    }
  };

  // Build the order summary data similar to ConfirmListingPanel
  const orderSummary: Record<string, ReactNode> = {
    'Listing Type': getListingTypeLabel(),
  };
  console.log(config);
  // Add price information based on listing type
  switch (listingType) {
    case 'fixed':
      orderSummary['Price'] = (
        <div className="flex flex-col items-end">
          <span className="text-white">
            {formatARIOWithCommas(config.price)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">{formatUsdValue(price)}</span>
          )}
        </div>
      );
      break;

    case 'dutch':
      orderSummary['Starting Price'] = (
        <div className="flex flex-col items-end">
          <span className="text-white">
            {formatARIOWithCommas(startingPrice || price)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">
              {formatUsdValue(startingPrice || price)}
            </span>
          )}
        </div>
      );
      orderSummary['Reserve Price'] = (
        <div className="flex flex-col items-end">
          <span className="text-white">
            {formatARIOWithCommas(reservePrice || price)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">
              {formatUsdValue(reservePrice || price)}
            </span>
          )}
        </div>
      );
      if (decrementInterval && decrementAmount) {
        orderSummary['Price Reduction'] = (
          <div className="flex flex-col items-end">
            <span className="text-white">
              -{formatARIOWithCommas(decrementAmount)} {arioTicker}
            </span>
            <span className="text-xs text-grey">
              Every {decrementInterval} hour{decrementInterval !== 1 ? 's' : ''}
            </span>
          </div>
        );
      }
      break;

    case 'english':
      orderSummary['Starting Bid'] = (
        <div className="flex flex-col items-end">
          <span className="text-white">
            {formatARIOWithCommas(price)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">{formatUsdValue(price)}</span>
          )}
        </div>
      );
      if (reservePrice) {
        orderSummary['Reserve Price'] = (
          <div className="flex flex-col items-end">
            <span className="text-white">
              {formatARIOWithCommas(reservePrice)} {arioTicker}
            </span>
            {arIoPrice && (
              <span className="text-xs text-grey">
                {formatUsdValue(reservePrice)}
              </span>
            )}
          </div>
        );
      }
      break;

    default:
      // Handle unknown listing types gracefully
      orderSummary['Price'] = (
        <div className="flex flex-col items-end">
          <span className="text-white">
            {formatARIOWithCommas(price)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">{formatUsdValue(price)}</span>
          )}
        </div>
      );
      break;
  }

  // Add expiration if available
  if (expirationDate) {
    orderSummary['Expires'] = (
      <div className="flex flex-col items-end">
        <span className="text-white">
          {expirationDate.toLocaleDateString()}
        </span>
        <span className="text-xs text-grey">
          {formatVerboseDate(expirationDate.getTime())}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Domain Card */}
      <div className="relative flex flex-col w-full rounded border border-dark-grey overflow-hidden">
        <ArNSLogo className="absolute w-[20rem] h-fit top-0 right-0" />
        <div className="flex flex-col bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-t text-light-grey px-6 py-4">
          <div className="flex w-fit gap-2 items-center z-10">
            <AntLogoIcon
              id={
                isArweaveTransactionID(domainInfo?.processId)
                  ? domainInfo?.logo
                  : DEFAULT_ANT_LOGO
              }
            />
            <div className="flex items-center w-fit">
              <span className="text-link-normal">ar://</span>
              <Tooltip
                tooltipOverrides={{
                  overlayClassName: 'w-fit',
                  overlayInnerStyle: {
                    whiteSpace: 'nowrap',
                    width: 'fit-content',
                    padding: '0.625rem',
                    border: '1px solid var(--text-faded)',
                  },
                }}
                message={decodeDomainToASCII(name ?? '')}
                icon={
                  <span className="text-white max-w-[11.25rem] truncate">
                    {decodeDomainToASCII(name ?? '')}
                  </span>
                }
              />
            </div>
            <ANTDetailsTip
              antId={domainInfo?.processId}
              targetId={domainInfo?.records?.['@']?.transactionId}
              owner={domainInfo?.owner ?? 'N/A'}
            />
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-2 mt-2 py-4 z-10">
            <div className="flex w-full justify-between">
              <span className="whitespace-nowrap font-sans-bold">
                Listing Summary
              </span>
            </div>

            {Object.entries(orderSummary).map(([key, value], i) => (
              <div className="flex flex-row w-full text-sm" key={i}>
                <span className="flex w-1/3 whitespace-nowrap text-grey">
                  {key}
                </span>
                <span className="flex w-2/3 whitespace-nowrap justify-end">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketplaceOrderInfoCard;
