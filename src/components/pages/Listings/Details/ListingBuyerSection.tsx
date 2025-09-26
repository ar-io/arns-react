import {
  Button,
  Card,
  Paragraph,
  shortenAddress,
} from '@blockydevs/arns-marketplace-ui';
import { useWalletState } from '@src/state';
import { openAoLinkExplorer } from '@src/utils/marketplace';
import { ExternalLink } from 'lucide-react';

interface Props {
  buyerAddress: string;
}

const ListingBuyerSection = ({ buyerAddress }: Props) => {
  const [{ walletAddress }] = useWalletState();

  return (
    <Card>
      <Paragraph className="text-xl text-[var(--ar-color-neutral-400)] mb-2">
        Buyer
      </Paragraph>
      <div className="flex gap-2 items-center">
        <Button
          variant="link"
          className="px-0 gap-1"
          icon={<ExternalLink width={16} height={16} />}
          iconPlacement="right"
          onClick={() => {
            openAoLinkExplorer(buyerAddress);
          }}
        >
          {shortenAddress(buyerAddress)}
        </Button>
        <span className="text-white text-sm font-normal text-[var(--ar-color-neutral-400)]">
          {buyerAddress === walletAddress?.toString() && '(Your wallet)'}
        </span>
      </div>
    </Card>
  );
};

export default ListingBuyerSection;
