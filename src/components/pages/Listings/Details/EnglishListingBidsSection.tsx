import {
  ListingEnglishDetails,
  marioToArio,
} from '@blockydevs/arns-marketplace-data';
import {
  BidsTable,
  Card,
  Pagination,
  Paragraph,
  formatDate,
} from '@blockydevs/arns-marketplace-ui';
import { AO_LINK_EXPLORER_URL } from '@src/utils/marketplace';
import { useState } from 'react';

interface Props {
  listing: ListingEnglishDetails;
  pageSize?: number;
}

const EnglishListingBidsSection = ({ listing, pageSize = 5 }: Props) => {
  const [bidPage, setBidPage] = useState(1);

  const allBids = listing.bids.map((bid) => ({
    bidder: bid.bidder,
    href: `${AO_LINK_EXPLORER_URL}/${bid.bidder}`,
    date: formatDate(bid.timestamp, 'dd-MM-yyyy HH:mm:ss'),
    price: `${marioToArio(bid.amount)} ARIO`,
  }));

  const totalBidPages = Math.max(1, Math.ceil(allBids.length / pageSize));
  const startIndex = (bidPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, allBids.length);
  const paginatedBids = allBids.slice(startIndex, endIndex);

  return (
    <Card>
      <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-3">
        Bids ({listing.bids.length})
      </Paragraph>
      <div className="mb-3">
        <BidsTable data={paginatedBids} />
      </div>
      <Pagination
        totalPages={totalBidPages}
        activeIndex={bidPage}
        onPageChange={setBidPage}
      />
    </Card>
  );
};

export default EnglishListingBidsSection;
