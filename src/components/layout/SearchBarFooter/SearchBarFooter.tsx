import { useIsMobile } from '../../../hooks';
import { SearchBarFooterProps } from '../../../types';
import { isDomainReservedLength, lowerCaseDomain } from '../../../utils';
import PDNTCard from '../../cards/PDNTCard/PDNTCard';
import AuctionChart from '../AuctionChart/AuctionChart';
import EmailNotificationCard from '../EmailNotificationCard/EmailNotificationCard';
import './styles.css';

function SearchBarFooter({
  domain,
  contractTxId,
  isAvailable,
  isAuction,
  isReserved,
}: SearchBarFooterProps): JSX.Element {
  const isMobile = useIsMobile();

  if (isAuction && domain) {
    return (
      <div className="flex flex-row">
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
        <EmailNotificationCard />
      </div>
    );
  }
  return (
    <div className="flex flex-column" style={{ marginTop: 30 }}>
      {!isAvailable && contractTxId && domain ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <PDNTCard
            domain={domain}
            contractTxId={contractTxId}
            compact={true}
            enableActions={true}
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
