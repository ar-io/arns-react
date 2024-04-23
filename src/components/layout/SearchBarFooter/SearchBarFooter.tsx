import { useWalletState } from '@src/state/contexts/WalletState';

import { useAuctionInfo, useIsMobile } from '../../../hooks';
import { SearchBarFooterProps } from '../../../types';
import { isDomainReservedLength, lowerCaseDomain } from '../../../utils';
import ANTCard from '../../cards/ANTCard/ANTCard';
import { ClockClockwiseIcon } from '../../icons';
import AuctionChart from '../AuctionChart/AuctionChart';
import BlockHeightCounter from '../BlockHeightCounter/BlockHeightCounter';
import ReservedNameNotificationCard from '../ReservedNameNotificationCard/ReservedNameNotificationCard';
import './styles.css';

function SearchBarFooter({
  domain,
  record,
  contractTxId,
  isAvailable,
  isActiveAuction,
  isReserved,
  reservee,
}: SearchBarFooterProps): JSX.Element {
  const isMobile = useIsMobile();
  const { auction } = useAuctionInfo(domain);
  const [{ walletAddress }] = useWalletState();

  if (isActiveAuction && domain) {
    return (
      <div className="flex flex-column">
        {auction && (
          <BlockHeightCounter
            prefixText={
              <span className="flex center" style={{ gap: '10px' }}>
                <ClockClockwiseIcon width={'18px'} height={'18px'} /> Next price
                update:
              </span>
            }
          />
        )}
        <AuctionChart
          domain={domain}
          showAuctionExplainer={true}
          chartHeight={isMobile ? 175 : undefined}
        />
      </div>
    );
  }

  if (
    domain &&
    (isReserved || isDomainReservedLength(lowerCaseDomain(domain))) &&
    reservee?.toString() !== walletAddress?.toString()
  ) {
    return (
      <div className="flex flex-row" style={{ marginTop: '30px' }}>
        <ReservedNameNotificationCard />
      </div>
    );
  }
  return (
    <div
      className="flex flex-column"
      style={{ marginTop: '30px', boxSizing: 'border-box' }}
    >
      {!isAvailable && record && contractTxId && domain ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <ANTCard
            domain={domain}
            contractTxId={contractTxId}
            record={record}
            compact={true}
            bordered
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchBarFooter;
