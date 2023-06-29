import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AuctionSettings, SearchBarFooterProps } from '../../../types';
import { RESERVED_NAME_LENGTH } from '../../../utils/constants';
import PDNTCard from '../../cards/PDNTCard/PDNTCard';
import AuctionChart from '../AuctionChart/AuctionChart';
import EmailNotificationCard from '../EmailNotificationCard/EmailNotificationCard';
import './styles.css';

function SearchBarFooter({
  searchTerm,
  searchResult,
  isAvailable,
  reservedList,
  auction,
}: SearchBarFooterProps): JSX.Element {
  const [{ pdnsSourceContract }] = useGlobalState();

  const auctionSettings = pdnsSourceContract?.settings?.auctions?.history.find(
    (a: AuctionSettings) => a.id === auction?.auctionSettingsId,
  );
  if (auction && auctionSettings) {
    return (
      <>
        <AuctionChart
          startHeight={auction.startHeight}
          auctionSettings={auctionSettings}
          initialPrice={auction.startPrice}
          floorPrice={auction.floorPrice}
        />
      </>
    );
  }

  if (
    (searchTerm && reservedList.includes(searchTerm)) ||
    (searchTerm && searchTerm.length <= RESERVED_NAME_LENGTH)
  ) {
    return (
      <div className="flex flex-row" style={{ marginTop: '30px' }}>
        <EmailNotificationCard />
      </div>
    );
  }
  return (
    <div className="flex flex-column" style={{ marginTop: 60 }}>
      {!isAvailable && searchResult && searchTerm ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <PDNTCard
            domain={searchTerm}
            id={searchResult}
            compact={true}
            enableActions={true}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchBarFooter;
