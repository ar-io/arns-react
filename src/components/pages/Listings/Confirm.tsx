import {
  Button,
  Card,
  GoBackHeader,
  Paragraph,
  Row,
  Spinner,
} from '@blockydevs/arns-marketplace-ui';
import { useBidListing } from '@src/hooks/listings/useBidListing';
import { useBuyListing } from '@src/hooks/listings/useBuyListing';
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { marketplaceQueryKeys } from '@src/utils/marketplace';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const Confirm = () => {
  const { id: listingId } = useParams();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [{ walletAddress }] = useWalletState();

  const name = searchParams[0].get('name') ?? '-';
  const antProcessId = searchParams[0].get('antProcessId');
  const price = searchParams[0].get('price');
  const type = searchParams[0].get('type');

  const mutationBuyListing = useBuyListing(antProcessId, listingId, type);
  const mutationBidListing = useBidListing(antProcessId, listingId);

  const isMutationPending =
    mutationBidListing.isPending || mutationBuyListing.isPending;
  const isMutationSuccess =
    mutationBidListing.isSuccess || mutationBuyListing.isSuccess;

  if (isMutationSuccess) {
    return (
      <>
        <GoBackHeader
          title="Transaction successful!"
          className="w-full my-12"
        />
        <div className="max-w-2xl w-full px-6 mx-auto pb-12">
          <Card className="flex flex-col gap-6">
            <Paragraph className="ar:text-neutral-200 text-center">
              {type === 'english'
                ? 'You can increase your bid anytime before the auction ends.'
                : 'Transaction confirmed – ANT is in your wallet.'}
            </Paragraph>
            <div className="flex flex-col gap-2 my-20">
              <Paragraph className="ar:text-neutral-400 text-center">
                Domain name
              </Paragraph>
              <Paragraph className="text-5xl font-medium text-white text-center break-words">
                {name}
              </Paragraph>
            </div>

            {type === 'english' ? (
              <Button
                variant="primary"
                size="small"
                onClick={() =>
                  navigate(listingId ? `/listings/${listingId}` : '/listings')
                }
              >
                View listing
              </Button>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => navigate('/my-ants')}
              >
                View your ANTs
              </Button>
            )}
          </Card>
          <div className="flex gap-6 mt-6">
            {type !== 'english' && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  navigate(listingId ? `/listings/${listingId}` : '/listings')
                }
              >
                View this listing
              </Button>
            )}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(`/listings`)}
            >
              Go to marketplace
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GoBackHeader
        title="Confirm purchase"
        className="w-full my-12"
        onGoBack={() => {
          navigate(listingId ? `/listings/${listingId}` : '/listings');
        }}
      />
      <div className="max-w-2xl w-full px-6 mx-auto pb-12">
        <Card className="flex flex-col gap-6">
          <Row label="Domain name" value={name} variant="large" />
          <Row label="Price" value={`${price} ARIO`} />
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                navigate(listingId ? `/listings/${listingId}` : '/listings');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="small"
              disabled={
                !walletAddress || isMutationPending || isMutationSuccess
              }
              onClick={() => {
                const operation = type === 'english' ? 'bid' : 'buy';
                const mutation =
                  operation === 'bid' ? mutationBidListing : mutationBuyListing;

                if (!price) {
                  eventEmitter.emit('error', {
                    name: 'Validation',
                    message: 'Price is required',
                  });

                  return;
                }

                mutation.mutate(
                  { price },
                  {
                    onError: (error) => {
                      eventEmitter.emit('error', {
                        name: `Failed to ${operation}`,
                        message: error.message,
                      });
                    },
                    onSuccess: async (data) => {
                      console.log(`${operation} success`, { data });
                      void Promise.allSettled([
                        queryClient.refetchQueries({
                          queryKey: [marketplaceQueryKeys.listings.all],
                        }),
                        queryClient.refetchQueries({
                          queryKey: [marketplaceQueryKeys.myANTs.all],
                        }),
                      ]);
                    },
                  },
                );
              }}
            >
              {!walletAddress
                ? 'No wallet'
                : type === 'english'
                ? 'Confirm bid'
                : 'Confirm purchase'}
            </Button>
          </div>
        </Card>
        {isMutationPending && (
          <div className="text-white flex mt-6 gap-3 items-center p-6 border ar:border-neutral-500 rounded-lg">
            <Spinner className="size-5" />
            <Paragraph className="text-xl">
              Waiting for wallet confirmation...
            </Paragraph>
          </div>
        )}
      </div>
    </>
  );
};

export default Confirm;
