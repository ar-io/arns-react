import { ListingDetails, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Paragraph,
  formatMillisecondsToDate,
} from '@blockydevs/arns-marketplace-ui';

import DutchListingPriceSection from './DutchListingPriceSection';
import EnglishListingPriceSection from './EnglishListingPriceSection';
import EnglishListingSettlementSection from './EnglishListingSettlementSection';
import FixedListingPriceSection from './FixedListingPriceSection';

interface Props {
  listing: ListingDetails;
}

const ListingPriceSection = ({ listing }: Props) => {
  switch (listing.type) {
    case 'english':
      return (
        <>
          <Paragraph>
            Starting price: {marioToArio(listing.startingPrice)} ARIO
          </Paragraph>
          {listing.status === 'active' && (
            <EnglishListingPriceSection listing={listing} />
          )}
          {listing.status === 'ready-for-settlement' && (
            <EnglishListingSettlementSection listing={listing} />
          )}
        </>
      );
    case 'dutch':
      return (
        <>
          <Paragraph>
            Starting price: {marioToArio(listing.startingPrice)} ARIO
          </Paragraph>
          <Paragraph>
            Floor price: {marioToArio(listing.minimumPrice)} ARIO
          </Paragraph>
          <Paragraph>
            Price decrease: every{' '}
            {formatMillisecondsToDate(Number(listing.decreaseInterval))}
          </Paragraph>
          {listing.status === 'active' && (
            <DutchListingPriceSection listing={listing} />
          )}
        </>
      );
    case 'fixed':
      return (
        <>
          {listing.status === 'active' && (
            <FixedListingPriceSection listing={listing} />
          )}
        </>
      );
    default:
      return null;
  }
};

export default ListingPriceSection;
