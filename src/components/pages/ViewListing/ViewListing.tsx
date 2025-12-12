import {
  AOProcess,
  ArNSMarketplaceWrite,
  Order,
  createAoSigner,
} from '@ar.io/sdk';
import { mARIOToTokenAmount } from '@ardrive/turbo-sdk';
import ANTDetailsTip from '@src/components/Tooltips/ANTDetailsTip';
import WarningCard from '@src/components/cards/WarningCard/WarningCard';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import LeaseDurationFromEndTimestamp from '@src/components/data-display/LeaseDurationFromEndTimestamp';
import { ArNSLogo } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useMarketplaceOrder } from '@src/hooks/useMarketplaceOrder';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import { decodeDomainToASCII } from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { ExternalLink, Globe, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function ViewListing() {
  const { name } = useParams<{ name: string }>();
  const [{ arioTicker, aoClient, arioContract, marketplaceProcessId }] =
    useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [isBuying, setIsBuying] = useState(false);

  // Get domain info to extract ANT process ID
  const {
    data: domainInfo,
    isLoading: domainLoading,
    error: domainError,
  } = useDomainInfo({
    domain: name,
  });

  // Get marketplace order details using ANT process ID
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useMarketplaceOrder({
    antId: domainInfo?.processId,
  });

  // Get ARIO price for USD conversion
  const { data: arioPrice } = useArIoPrice();

  const isLoading = domainLoading || orderLoading;
  const hasError = domainError || orderError;

  async function handleBuy() {
    setIsBuying(true);
    try {
      if (!orderData) {
        throw new Error('Order not found');
      }
      if (!domainInfo?.processId) {
        throw new Error('ANT process ID not found');
      }
      if (!wallet?.contractSigner) {
        throw new Error('Wallet not found');
      }
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }
      if (!name) {
        throw new Error('Domain name not found');
      }
      const marketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as any,
      });

      const result = await marketplaceContract.buyFixedPriceANT({
        antId: domainInfo.processId,
      });

      queryClient.resetQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key: unknown) =>
              typeof key === 'string' && key.includes(domainInfo.processId),
          ),
      });
      queryClient.resetQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key: unknown) => typeof key === 'string' && key.includes(name),
          ),
      });
      eventEmitter.emit('success', {
        name: 'Buy ANT',
        message: (
          <span>
            Successfully bought ANT {domainInfo.processId}
            <br />
            <br />
            <span>View transaction on aolink</span>
            <ArweaveID
              id={new ArweaveTransactionID(result.id)}
              type={ArweaveIdTypes.INTERACTION}
              characterCount={8}
              shouldLink={true}
            />
          </span>
        ),
      });
    } catch (error) {
      console.error(error);
      eventEmitter.emit('error', error);
    } finally {
      setIsBuying(false);
    }
  }

  // Handle case where domain doesn't exist or isn't listed
  if (!isLoading && (!domainInfo || !orderData)) {
    return (
      <div className="page text-white">
        <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
          <h1 className="text-white text-4xl font-bold text-center">
            Listing Not Found
          </h1>
          <WarningCard
            text="This domain is not currently listed in the marketplace."
            wrapperStyle={{ maxWidth: '100%' }}
          />
          <div className="flex gap-4">
            <Link
              to="/marketplace"
              className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition-colors font-medium"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/"
              className="border border-white text-white px-6 py-3 rounded hover:bg-white hover:text-black transition-colors font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page text-white">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-white text-xl">Loading listing details...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="page text-white">
        <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
          <h1 className="text-white text-4xl font-bold text-center">
            Error Loading Listing
          </h1>
          <WarningCard
            text="There was an error loading the listing details. Please try again later."
            wrapperStyle={{ maxWidth: '100%' }}
          />
          <Link
            to="/marketplace"
            className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Convert price from mARIO to ARIO
  const priceInArio = orderData?.price
    ? Number(mARIOToTokenAmount(orderData.price).valueOf())
    : 0;
  const priceInUsd =
    arioPrice && typeof arioPrice === 'number' ? priceInArio * arioPrice : null;

  return (
    <div className="page text-white">
      <div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/marketplace"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Marketplace
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Domain Info Card */}
          <div className="relative flex flex-col w-full rounded border border-dark-grey min-w-[30rem] h-full">
            <ArNSLogo className="absolute w-[20rem] h-fit top-0 right-0" />
            <div className="flex flex-col bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-t text-light-grey p-6 h-full">
              <div className="flex w-fit gap-2 items-center z-10 mb-6">
                <AntLogoIcon id={domainInfo?.logo} />
                <div className="flex items-center w-fit">
                  <span className="text-link-normal">ar://</span>
                  <span className="text-white">
                    {decodeDomainToASCII(name || '')}
                  </span>
                </div>
                <ANTDetailsTip
                  antId={domainInfo?.processId}
                  targetId={domainInfo?.records?.['@']?.transactionId}
                  owner={domainInfo?.owner ?? orderData?.creator}
                />
              </div>

              {/* Domain Details */}
              <div className="flex w-full flex-col border-y-[1px] border-foreground gap-2 py-6 z-10">
                {orderData?.creator && (
                  <div className="flex items-center justify-between gap-2 text-grey text-sm">
                    <span>Owner:</span>
                    <div className="flex items-end justify-end">
                      <ArweaveID
                        id={new ArweaveTransactionID(orderData.creator)}
                        type={ArweaveIdTypes.ADDRESS}
                        shouldLink={true}
                        characterCount={12}
                      />
                    </div>
                  </div>
                )}

                {domainInfo?.undernameCount !== undefined && (
                  <div className="text-grey text-sm flex items-center justify-between">
                    <span>Undernames: </span>
                    <span className="text-white flex justify-end items-center">
                      {domainInfo.undernameCount}
                    </span>
                  </div>
                )}

                <div className="text-grey flex items-center justify-between gap-2 text-sm">
                  <span className="whitespace-nowrap">ANT Process: </span>
                  <span className="text-white font-mono flex justify-end">
                    <ArweaveID
                      id={new ArweaveTransactionID(domainInfo?.processId)}
                      type={ArweaveIdTypes.CONTRACT}
                      shouldLink={true}
                      characterCount={12}
                    />
                  </span>
                </div>

                <div className="text-grey text-sm flex items-center justify-between">
                  <span>Lease Duration: </span>
                  <span className="text-white">
                    <LeaseDurationFromEndTimestamp
                      endTimestamp={
                        domainInfo?.arnsRecord?.type === 'lease'
                          ? (domainInfo.arnsRecord as any)?.endTimestamp
                          : undefined // Permabuy domains or no record - let component show "Permanent"
                      }
                    />
                  </span>
                </div>
              </div>

              <div className="pt-6">
                {/* Price Section */}
                <div className="border-b border-foreground pb-4">
                  <div className="text-grey text-sm mb-2 whitespace-nowrap">
                    Price
                  </div>
                  <div className="text-white text-3xl font-bold">
                    {formatARIOWithCommas(priceInArio)} {arioTicker}
                  </div>
                  {priceInUsd && (
                    <div className="text-grey text-lg">
                      ≈ $
                      {priceInUsd.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      USD
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="space-y-3 pt-6 text-sm">
                  {orderData?.creator && (
                    <div className="flex justify-between">
                      <span className="text-grey whitespace-nowrap">
                        Seller:
                      </span>
                      <a
                        href={`https://aolink.ar-io.dev/#/entity/${orderData.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 justify-end"
                      >
                        {orderData.creator.slice(0, 8)}...
                        {orderData.creator.slice(-8)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {orderData?.dateCreated && (
                    <div className="flex justify-between">
                      <span className="text-grey whitespace-nowrap">
                        Listed:
                      </span>
                      <span className="text-white flex justify-end">
                        {new Date(orderData.dateCreated).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {orderData?.expirationTime && (
                    <div className="flex justify-between">
                      <span className="text-grey whitespace-nowrap">
                        Expires:
                      </span>
                      <span className="text-white flex justify-end">
                        {new Date(orderData.expirationTime).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {orderData?.id && (
                    <div className="flex justify-between">
                      <span className="text-grey whitespace-nowrap">
                        Order ID:
                      </span>
                      <div className="flex justify-end">
                        <ArweaveID
                          id={new ArweaveTransactionID(orderData.id)}
                          type={ArweaveIdTypes.INTERACTION}
                          characterCount={12}
                          shouldLink={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <button
                  className={`w-full font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2 mt-8 ${
                    isBuying
                      ? 'bg-grey text-white cursor-not-allowed'
                      : 'bg-primary hover:bg-warning text-black'
                  }`}
                  onClick={handleBuy}
                  disabled={isBuying}
                >
                  {isBuying ? (
                    <>
                      <Loader size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewListing;
