import { useCountdown } from '@src/hooks/useCountdown';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useWalletState } from '@src/state';
import { isArweaveTransactionID } from '@src/utils';
import { DEFAULT_ANT_LOGO } from '@src/utils/constants';
import { RotateCw } from 'lucide-react';
import { ReactNode } from 'react';

import ANTDetailsTip from '../Tooltips/ANTDetailsTip';
import { Tooltip } from '../data-display';
import { AntLogoIcon } from '../data-display/AntLogoIcon';
import { ArNSLogo } from '../icons';

export type DomainCheckoutCardProps = {
  domain: string;
  antId?: string;
  targetId?: string;
  orderSummary: Record<string, ReactNode>;
  fees: Record<string, ReactNode>;
  quoteEndTimestamp: number;
  refresh: () => void;
};

function DomainCheckoutCard({
  domain,
  antId,
  targetId,
  orderSummary,
  fees,
  quoteEndTimestamp,
  refresh,
}: DomainCheckoutCardProps) {
  const [{ walletAddress }] = useWalletState();
  const { data: domainInfo } = useDomainInfo({
    antId: isArweaveTransactionID(antId) ? antId : undefined,
  });

  const countdownString = useCountdown(quoteEndTimestamp);

  return (
    <div className="relative flex flex-col w-full h-full rounded border border-dark-grey overflow-hidden transition-all duration-300">
      {/* domain detail card */}
      <ArNSLogo className="absolute w-[20rem] h-fit top-0 right-0" />
      <div className="flex flex-col size-full bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-t text-light-grey p-6">
        <div className="flex w-fit gap-2 items-center z-10">
          <AntLogoIcon
            id={
              isArweaveTransactionID(antId)
                ? domainInfo?.logo
                : DEFAULT_ANT_LOGO
            }
          />
          <div className="flex items-center w-fit ">
            {' '}
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
              message={domain}
              icon={
                <span className="text-white max-w-[11.25rem] truncate">
                  {' '}
                  {domain}
                </span>
              }
            />
          </div>{' '}
          <ANTDetailsTip
            antId={antId}
            targetId={domainInfo?.records?.['@']?.transactionId ?? targetId}
            owner={domainInfo?.owner ?? walletAddress?.toString()}
          />
        </div>
        {/* Order Info */}
        <div
          className={`flex flex-col border-y-[1px] border-foreground gap-4 mt-8 py-6 size-full z-10`}
        >
          <div className="flex w-full justify-between pb-4">
            <span className="whitespace-nowrap font-sans-bold">
              Order Summary
            </span>
          </div>

          {Object.entries(orderSummary).map(([key, value], i) => (
            <div className="flex flex-row w-full text-sm" key={i}>
              <span className="flex w-1/3 whitespace-nowrap text-grey">
                {key}
              </span>
              <span className="flex w-1/2 whitespace-nowrap">{value}</span>
            </div>
          ))}

          {/* Prices */}
        </div>{' '}
        <div className="flex flex-col gap-4 py-6">
          <div className="flex flex-col gap-2 w-full justify-between">
            {Object.entries(fees).map(([key, value], i) => (
              <div
                className="flex flex-row w-full text-sm justify-between"
                key={i}
              >
                <span className="flex w-1/3 whitespace-nowrap text-grey">
                  {key}
                </span>
                <span className="flex w-1/2 whitespace-nowrap justify-end">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Quote update timer */}
      <div className="flex w-full bg-foreground rounded-b px-6 p-3 text-grey justify-between text-sm">
        <span>
          {quoteEndTimestamp < 0 ? (
            <span className="text-error">Error fetching quote</span>
          ) : countdownString ? (
            <span className="whitespace-nowrap">
              Quote updates in{' '}
              <span className="text-white text-bold">{countdownString}</span>
            </span>
          ) : (
            <span className="animate-pulse">Updating quote...</span>
          )}
        </span>
        {quoteEndTimestamp > 0 && (
          <button
            onClick={refresh}
            className="flex gap-2 items-center justify-center text-center text-grey pointer"
          >
            <RotateCw
              className={`text-grey size-4 ${
                !countdownString ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

export default DomainCheckoutCard;
