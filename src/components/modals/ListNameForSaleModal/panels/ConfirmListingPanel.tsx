import {
  ARIOToken,
  calculateListingFee,
  calculateSaleTax,
  mARIOToken,
} from '@ar.io/sdk';
import * as Popover from '@radix-ui/react-popover';
import ANTDetailsTip from '@src/components/Tooltips/ANTDetailsTip';
import { Tooltip } from '@src/components/data-display';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import { InfoIcon } from '@src/components/icons';
import { ArNSLogo } from '@src/components/icons';
import { Checkbox } from '@src/components/inputs/Checkbox';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useMarketplaceInfo } from '@src/hooks/useMarketplaceInfo';
import { useWalletState } from '@src/state';
import { decodeDomainToASCII, isArweaveTransactionID } from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import { DEFAULT_ANT_LOGO } from '@src/utils/constants';
import { ReactNode, useCallback, useState } from 'react';

export type ConfirmListingPanelProps = {
  domainName: string;
  antId?: string;
  listingType: 'fixed' | 'dutch' | 'english';
  listingPrice: number;
  arioTicker: string;
  arIoPrice?: number;
  expirationDate?: Date;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

function ConfirmListingPanel({
  domainName,
  antId,
  listingType,
  listingPrice,
  arioTicker,
  arIoPrice,
  expirationDate,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmListingPanelProps) {
  const [{ walletAddress }] = useWalletState();
  const { data: domainInfo } = useDomainInfo({
    antId: isArweaveTransactionID(antId) ? antId : undefined,
  });
  const { data: marketplaceInfo } = useMarketplaceInfo();
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const formatUsdValue = (arIOAmount: number): string => {
    if (!arIoPrice || arIOAmount === 0) return '';
    const usdValue = arIOAmount * arIoPrice;
    return `≈ $${usdValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} USD`;
  };

  // Calculate marketplace fees using useCallback
  const calculateFees = useCallback(() => {
    if (!marketplaceInfo?.fees || !expirationDate) {
      return {
        listingFee: 0,
        saleTax: 0,
        totalFees: 0,
        youWillReceive: listingPrice,
      };
    }
    const expirationTime = expirationDate.getTime();
    const listingFee = calculateListingFee({
      listingFeePerHour: marketplaceInfo.fees.listingFeePerHour.toString(),
      endTimestamp: expirationTime,
    });
    const saleTax = calculateSaleTax({
      saleAmount: new ARIOToken(listingPrice).toMARIO().valueOf().toString(),
      saleTaxNumerator: marketplaceInfo.fees.saleTaxNumerator,
      saleTaxDenominator: marketplaceInfo.fees.saleTaxDenominator,
    });
    const totalFees = new mARIOToken(Number(listingFee + saleTax))
      .toARIO()
      .valueOf();

    // Only deduct sale tax from received amount - listing fee is paid upfront
    const youWillReceive =
      listingPrice - new mARIOToken(Number(saleTax)).toARIO().valueOf();

    return {
      listingFee: new mARIOToken(Number(listingFee.valueOf()))
        .toARIO()
        .valueOf(),
      saleTax: new mARIOToken(Number(saleTax.valueOf())).toARIO().valueOf(),
      totalFees,
      youWillReceive,
    };
  }, [listingPrice, expirationDate, marketplaceInfo?.fees]);

  const { listingFee, saleTax, youWillReceive } = calculateFees();

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

  const orderSummary: Record<string, ReactNode> = {
    'Listing Type': getListingTypeLabel(),
    'Domain Name': domainName,
    'Current Owner':
      walletAddress?.toString().slice(0, 8) +
      '...' +
      walletAddress?.toString().slice(-8),
    Expires: expirationDate
      ? expirationDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Not set',
  };

  // All listing details in the correct order
  const allListingEntries = [
    {
      key: 'Listing Price',
      value: (
        <div className="flex flex-col items-end">
          <span>
            {formatARIOWithCommas(listingPrice)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">
              {formatUsdValue(listingPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: (
        <div className="flex items-center gap-1">
          <span>Listing Fee</span>
          <Tooltip
            message={`1 ${arioTicker} per hour the listing is live (paid upfront)`}
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
              },
            }}
          />
        </div>
      ),
      value: (
        <div className="flex flex-col items-end">
          <span>
            {formatARIOWithCommas(listingFee)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">
              {formatUsdValue(listingFee)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: (
        <div className="flex items-center gap-1">
          <span>Marketplace Fee</span>
          <Tooltip
            message="5% fee on the sale price"
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
              },
            }}
          />
        </div>
      ),
      value: (
        <div className="flex flex-col items-end">
          <span>
            {formatARIOWithCommas(saleTax)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">{formatUsdValue(saleTax)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'You will receive (after sale)',
      value: (
        <div className="flex flex-col items-end">
          <span className="text-white font-medium">
            {formatARIOWithCommas(youWillReceive)} {arioTicker}
          </span>
          {arIoPrice && (
            <span className="text-xs text-grey">
              {formatUsdValue(youWillReceive)}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-6 gap-6">
      {/* Domain Card */}
      <div className="relative flex flex-col w-full rounded border border-dark-grey overflow-hidden">
        <ArNSLogo className="absolute w-[20rem] h-fit top-0 right-0" />
        <div className="flex flex-col bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-t text-light-grey p-6">
          <div className="flex w-fit gap-2 items-center z-10">
            <AntLogoIcon
              id={
                isArweaveTransactionID(antId)
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
                message={decodeDomainToASCII(domainName)}
                icon={
                  <span className="text-white max-w-[11.25rem] truncate">
                    {decodeDomainToASCII(domainName)}
                  </span>
                }
              />
            </div>
            <ANTDetailsTip
              antId={antId}
              targetId={domainInfo?.records?.['@']?.transactionId}
              owner={domainInfo?.owner ?? walletAddress?.toString()}
            />
          </div>

          {/* Order Summary */}
          <div className="flex flex-col border-y-[1px] border-foreground gap-4 mt-8 py-6 z-10">
            <div className="flex w-full justify-between pb-4">
              <span className="whitespace-nowrap font-sans-bold">
                Listing Summary
              </span>
            </div>

            {Object.entries(orderSummary).map(([key, value], i) => (
              <div className="flex flex-row w-full text-sm" key={i}>
                <span className="flex w-1/3 whitespace-nowrap text-grey">
                  {key}
                </span>
                <span className="flex w-2/3 whitespace-nowrap">{value}</span>
              </div>
            ))}
          </div>

          {/* Listing Details */}
          <div className="flex flex-col gap-4 py-6">
            <div className="flex flex-col gap-2 w-full justify-between">
              {allListingEntries.map((entry, i) => (
                <div
                  className="flex flex-row w-full text-sm justify-between"
                  key={i}
                >
                  <span className="flex w-1/2 whitespace-nowrap text-grey">
                    {entry.key}
                  </span>
                  <span className="flex w-1/2 whitespace-nowrap justify-end">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex w-full bg-foreground rounded-b px-6 p-4">
          <div className="flex items-start gap-3 w-full">
            <Checkbox
              id="marketplace-agreement"
              checked={agreementChecked}
              onCheckedChange={(checked) =>
                setAgreementChecked(
                  checked === 'indeterminate' ? false : checked,
                )
              }
              label={
                <div className="items-center justify-center gap-2 flex">
                  <span className="text-sm text-white">
                    I understand the fees and conditions for listing my name
                  </span>
                  <Popover.Root
                    open={isPopoverOpen}
                    onOpenChange={setIsPopoverOpen}
                  >
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center"
                        onMouseEnter={() => setIsPopoverOpen(true)}
                        onMouseLeave={() => setIsPopoverOpen(false)}
                      >
                        <InfoIcon
                          style={{
                            fontSize: '16px',
                            fill: 'var(--text-grey)',
                            width: '16px',
                            cursor: 'pointer',
                          }}
                        />
                      </button>
                    </Popover.Trigger>

                    <Popover.Portal>
                      <Popover.Content
                        className="w-[400px] rounded-lg border border-dark-grey bg-metallic-grey shadow-lg p-4"
                        style={{ zIndex: 99999 }}
                        sideOffset={8}
                        align="center"
                        onMouseEnter={() => setIsPopoverOpen(true)}
                        onMouseLeave={() => setIsPopoverOpen(false)}
                      >
                        <div className="text-sm text-light-grey flex flex-col gap-3 p-2">
                          <div className="font-medium text-white text-base">
                            Important Notice:
                          </div>
                          <ul className="list-disc list-outside space-y-2 text-sm">
                            <li>
                              Fees and escrow:
                              <ul className="list-decimal list-inside space-y-2 text-sm pl-4 pt-1">
                                <li>
                                  A listing fee will be charged upfront to list
                                  your name for sale commensurate with the
                                  scheduled duration of the listing.
                                </li>
                                <li>
                                  Marketplace fees will be deducted from the
                                  final sale amount and buyers will pay the full
                                  listing price to purchase your domain
                                </li>
                                <li>
                                  Your name will be escrowed until the sale is
                                  completed.
                                </li>
                              </ul>
                            </li>
                            <li>
                              Cancellation and modification policies:
                              <ul className="list-decimal list-inside space-y-2 text-sm pl-4 pt-1">
                                <li>
                                  Fixed price and Dutch auction listings can be
                                  cancelled.
                                </li>
                                <li>
                                  English auction listings can be modified or
                                  cancelled until the first bid is placed.
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="flex-1 bg-transparent border border-grey text-white px-6 py-3 rounded hover:bg-grey hover:bg-opacity-20 transition-colors"
          onClick={onCancel}
          disabled={isLoading}
        >
          Back
        </button>
        <button
          className={`flex-1 px-6 py-3 rounded transition-colors ${
            isLoading || !agreementChecked
              ? 'bg-grey text-white cursor-not-allowed'
              : 'bg-primary text-black hover:bg-primary-dark'
          }`}
          onClick={onConfirm}
          disabled={isLoading || !agreementChecked}
        >
          {isLoading ? 'Creating Listing...' : 'Confirm Listing'}
        </button>
      </div>
    </div>
  );
}

export default ConfirmListingPanel;
