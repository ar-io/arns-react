import { useIsMobile } from '../../../hooks';
import { SearchBarFooterProps } from '../../../types';
import { isDomainReservedLength, lowerCaseDomain } from '../../../utils';
import PDNTCard from '../../cards/PDNTCard/PDNTCard';
import AuctionChart from '../AuctionChart/AuctionChart';
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

  if (isActiveAuction && domain) {
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
          <PDNTCard
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
