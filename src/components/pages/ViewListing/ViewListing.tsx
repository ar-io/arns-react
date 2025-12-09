import WarningCard from '@src/components/cards/WarningCard/WarningCard';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useMarketplaceOrder } from '@src/hooks/useMarketplaceOrder';
import { useGlobalState } from '@src/state';
import { decodeDomainToASCII } from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import { ExternalLink, Globe, ShoppingCart, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

function ViewListing() {
  const { name } = useParams<{ name: string }>();
  const [{ arioTicker }] = useGlobalState();

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

  // Handle case where domain doesn't exist or isn't listed
  if (!isLoading && (!domainInfo || !orderData)) {
    return (
      <div className="page">
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
      <div className="page">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-white text-xl">Loading listing details...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="page">
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

  const priceInArio =
    typeof (orderData as any)?.price === 'number'
      ? (orderData as any).price
      : 0;
  const priceInUsd =
    arioPrice && typeof arioPrice === 'number' ? priceInArio * arioPrice : null;

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Domain Info Card */}
          <div className="bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <AntLogoIcon id={domainInfo?.logo} className="w-12 h-12" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">ar://</span>
                  <span className="text-white text-xl font-semibold">
                    {decodeDomainToASCII(name || '')}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  ANT Process: {domainInfo?.processId}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Globe className="w-4 h-4" />
                <Link
                  to={`/manage/names/${name}`}
                  className="hover:text-white transition-colors"
                >
                  View Domain Details
                </Link>
              </div>

              {domainInfo?.owner && (
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" />
                  <span>Owner:</span>
                  <a
                    href={`https://aolink.ar-io.dev/#/entity/${domainInfo.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    {domainInfo.owner.slice(0, 8)}...
                    {domainInfo.owner.slice(-8)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {domainInfo?.undernameCount !== undefined && (
                <div className="text-gray-300">
                  <span>Undernames: </span>
                  <span className="text-white">
                    {domainInfo.undernameCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Listing Details Card */}
          <div className="bg-gradient-to-b from-[#1C1C1F] to-[#0E0E0F] rounded-lg border border-gray-700 p-6">
            <h2 className="text-white text-2xl font-bold mb-6">
              Listing Details
            </h2>

            <div className="space-y-6">
              {/* Price Section */}
              <div className="border-b border-gray-600 pb-4">
                <div className="text-gray-400 text-sm mb-2">Price</div>
                <div className="text-white text-3xl font-bold">
                  {formatARIOWithCommas(priceInArio)} {arioTicker}
                </div>
                {priceInUsd && (
                  <div className="text-gray-400 text-lg">
                    ≈ ${formatARIOWithCommas(priceInUsd)} USD
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="space-y-3">
                {(orderData as any)?.creator && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seller:</span>
                    <a
                      href={`https://aolink.ar-io.dev/#/entity/${(orderData as any).creator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                      {(orderData as any).creator.slice(0, 8)}...
                      {(orderData as any).creator.slice(-8)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {(orderData as any)?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Listed:</span>
                    <span className="text-white">
                      {new Date(
                        typeof (orderData as any).createdAt === 'number'
                          ? (orderData as any).createdAt * 1000
                          : (orderData as any).createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {(orderData as any)?.id && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-white font-mono text-sm">
                      {(orderData as any).id.slice(0, 12)}...
                    </span>
                  </div>
                )}
              </div>

              {/* Buy Button */}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-8"
                onClick={() => {
                  // TODO: Implement buy functionality
                  console.log(
                    'Buy now clicked for order:',
                    (orderData as any)?.id,
                  );
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewListing;
