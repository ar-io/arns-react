import { ListingDetails, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  Card,
  DecreaseScheduleTable,
  Header,
  Paragraph,
  Row,
  Schedule,
  formatDate,
  getDutchListingSchedule,
  shortenAddress,
} from '@blockydevs/arns-marketplace-ui';
import { openAoLinkExplorer } from '@src/utils/marketplace';
import { ExternalLink } from 'lucide-react';

interface Props {
  listing: ListingDetails;
}

const ListingMetadata = ({ listing }: Props) => {
  const dutchPriceSchedule: Schedule[] =
    listing.type === 'dutch'
      ? getDutchListingSchedule({
          startingPrice: listing.startingPrice,
          minimumPrice: listing.minimumPrice,
          decreaseInterval: listing.decreaseInterval,
          decreaseStep: listing.decreaseStep,
          createdAt: new Date(listing.createdAt).getTime(),
          endedAt: new Date(
            'endedAt' in listing ? listing.endedAt : listing.expiresAt,
          ).getTime(),
        }).map((item) => ({
          date: formatDate(item.date),
          price: Number(marioToArio(item.price)),
        }))
      : [];

  return (
    <div className="flex flex-col gap-4 lg:col-span-3">
      <Card>
        <Header size="h1" className="break-all">
          {listing.name}
        </Header>
      </Card>
      {listing.ownershipType === 'lease' && !!listing.leaseEndsAt && (
        <Card>
          <Row label="Lease expiration">
            <Paragraph>{formatDate(listing.leaseEndsAt)}</Paragraph>
          </Row>
        </Card>
      )}
      <Card>
        <Paragraph className="mb-5">Metadata</Paragraph>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Seller wallet">
            <Button
              variant="link"
              className="inline-flex w-fit px-0"
              icon={<ExternalLink width={16} height={16} />}
              iconPlacement="right"
              onClick={() => {
                openAoLinkExplorer(listing.sender);
              }}
            >
              {shortenAddress(listing.sender)}
            </Button>
          </Row>
          <Row label="View on explorer">
            <Button
              variant="link"
              className="inline-flex w-fit px-0"
              icon={<ExternalLink width={16} height={16} />}
              iconPlacement="right"
              onClick={() => {
                openAoLinkExplorer(listing.orderId);
              }}
            >
              {shortenAddress(listing.orderId)}
            </Button>
          </Row>
        </div>
      </Card>
      {listing.type === 'dutch' && (
        <Card>
          <Paragraph fontWeight="medium" size="large" className="mb-4">
            Price decrease schedule
          </Paragraph>
          <div className="max-h-80 overflow-y-auto">
            <DecreaseScheduleTable data={dutchPriceSchedule} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ListingMetadata;
