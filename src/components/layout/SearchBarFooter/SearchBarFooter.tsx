import { useAuctionInfo, useIsMobile } from '../../../hooks';
import { SearchBarFooterProps } from '../../../types';
import { isDomainReservedLength, lowerCaseDomain } from '../../../utils';
import ANTCard from '../../cards/ANTCard/ANTCard';
import AuctionChart from '../AuctionChart/AuctionChart';
import NextPriceUpdate from '../NextPriceUpdate/NextPriceUpdate';
import ReservedNameNotificationCard from '../ReservedNameNotificationCard/ReservedNameNotificationCard';
import './styles.css';

function SearchBarFooter({
  domain,
  record,
  contractTxId,
  isAvailable,
  isActiveAuction,
  isReserved,
}: SearchBarFooterProps): JSX.Element {
  const isMobile = useIsMobile();
  const { auction } = useAuctionInfo(domain);

  if (isActiveAuction && domain) {
    return (
      <div className="flex flex-column">
        {auction && <NextPriceUpdate auction={auction} />}
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
    (isReserved || isDomainReservedLength(lowerCaseDomain(domain)))
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
