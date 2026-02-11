import {
  AOProcess,
  ARIOToken,
  AoARIOWrite,
  ArNSMarketplaceWrite,
  Order,
  createAoSigner,
  mARIOToken,
} from '@ar.io/sdk';
import ANTDetailsTip from '@src/components/Tooltips/ANTDetailsTip';
import WarningCard from '@src/components/cards/WarningCard/WarningCard';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import LeaseDurationFromEndTimestamp from '@src/components/data-display/LeaseDurationFromEndTimestamp';
import VerticalTimelineStepper from '@src/components/data-display/VerticalTimelineStepper';
import { ArNSLogo } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useMarketplaceOrder } from '@src/hooks/useMarketplaceOrder';
import { useMarketplaceUserAssets } from '@src/hooks/useMarketplaceUserAssets';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import {
  decodeDomainToASCII,
  isArweaveTransactionID,
  isEthAddress,
  sleep,
} from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import {
  ArrowLeftIcon,
  CheckIcon,
  DollarSign,
  ExternalLink,
  LucideProps,
  ShoppingCart,
  XIcon,
} from 'lucide-react';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const defaultBuyWorkflowSteps: Record<
  string,
  {
    title: ReactNode;
    description: ReactNode;
    icon: ReactNode;
  }
> = {
  deposit: {
    title: 'Deposit Payment',
    description: 'Deposit ARIO to the marketplace',
    icon: <DollarSign className="w-4 h-4 text-grey" />,
  },
  buy: {
    title: 'Purchase Name',
    description: 'Execute the purchase transaction',
    icon: <ShoppingCart className="w-4 h-4 text-grey" />,
  },
  complete: {
    title: 'Complete',
    description: 'Name has been purchased',
    icon: <CheckIcon className="w-4 h-4 text-grey" />,
  },
};

const defaultCancelWorkflowSteps: Record<
  string,
  {
    title: ReactNode;
    description: ReactNode;
    icon: ReactNode;
  }
> = {
  cancel: {
    title: 'Cancel Order',
    description: 'Remove listing from marketplace',
    icon: <XIcon className="w-4 h-4 text-grey" />,
  },
  complete: {
    title: 'Complete',
    description: 'Listing has been cancelled',
    icon: <CheckIcon className="w-4 h-4 text-grey" />,
  },
};

function ViewListing() {
  const { name } = useParams<{ name: string }>();
  const [{ arioTicker, aoClient, arioContract, marketplaceProcessId }] =
    useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [isBuying, setIsBuying] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [workflowComplete, setWorkflowComplete] = useState(false);
  const [workflowError, setWorkflowError] = useState(false);

  const [workflowSteps, setWorkflowSteps] = useState(defaultBuyWorkflowSteps);

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

  // Get user's marketplace balance
  const { data: userAssets } = useMarketplaceUserAssets();

  const isLoading = domainLoading || orderLoading;
  const hasError = domainError || orderError;

  // Check if the order is expired
  const isExpired = useMemo(() => {
    if (!orderData?.expirationTime) return false;
    return Date.now() >= orderData.expirationTime;
  }, [orderData?.expirationTime]);

  // Check if user has sufficient balance for the purchase
  const hasSufficientBalance = useMemo(() => {
    if (!orderData?.price || !userAssets?.balances?.balance) return false;
    const userBalance = new mARIOToken(Number(userAssets.balances.balance ?? 0))
      .toARIO()
      .valueOf();
    const orderPrice = new mARIOToken(Number(orderData.price))
      .toARIO()
      .valueOf();
    return userBalance >= orderPrice;
  }, [orderData?.price, userAssets?.balances?.balance]);

  // Check if the current user is the seller
  const isUserSeller = useMemo(() => {
    return (
      walletAddress &&
      orderData?.creator &&
      walletAddress.toString() === orderData.creator
    );
  }, [walletAddress, orderData?.creator]);

  const updateWorkflowSteps = useCallback(
    ({
      step,
      status,
      description,
    }: {
      step: 'deposit' | 'buy' | 'cancel' | 'complete';
      status: 'pending' | 'processing' | 'success' | 'error';
      description?: string;
    }) => {
      const DepositIcon = DollarSign;
      const BuyIcon = ShoppingCart;
      const CancelIcon = XIcon;
      const CompleteIcon = CheckIcon;
      const ErrorIcon = XIcon;

      let CurrentIcon: React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
      >;
      switch (step) {
        case 'deposit':
          CurrentIcon = DepositIcon;
          break;
        case 'buy':
          CurrentIcon = BuyIcon;
          break;
        case 'cancel':
          CurrentIcon = CancelIcon;
          break;
        case 'complete':
          CurrentIcon = CompleteIcon;
          break;
        default:
          CurrentIcon = ErrorIcon;
          break;
      }

      const iconClass = {
        pending: 'w-4 h-4 text-grey',
        processing: 'w-4 h-4 animate-spin text-white',
        success: 'w-4 h-4 text-success',
        error: 'w-4 h-4 text-error',
      }[status];

      const IconComponent =
        status === 'processing' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <CurrentIcon className={iconClass} />
        );

      setWorkflowSteps((prev) => ({
        ...prev,
        [step]: {
          ...prev[step],
          icon: IconComponent,
          description: description ?? prev[step].description,
        },
      }));
    },
    [],
  );

  async function handleBuy() {
    setIsBuying(true);
    setShowProcessing(true);
    setWorkflowComplete(false);
    setWorkflowError(false);
    setWorkflowSteps(defaultBuyWorkflowSteps);

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
      if (isExpired) {
        throw new Error('This listing has expired');
      }

      const marketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as AoARIOWrite,
      });

      if (!orderData.price) {
        throw new Error('Order price not found');
      }
      const orderPrice = new mARIOToken(Number(orderData.price))
        .toARIO()
        .valueOf();

      // Step 1: Deposit if needed
      if (!hasSufficientBalance) {
        updateWorkflowSteps({ step: 'deposit', status: 'processing' });

        const existingBalance = userAssets?.balances?.balance
          ? new mARIOToken(Number(userAssets.balances.balance ?? 0))
              .toARIO()
              .valueOf()
          : 0;

        const amountToDeposit = Math.max(
          1,
          Math.ceil(orderPrice - existingBalance),
        );

        try {
          await marketplaceContract.depositArIO({
            amount: new ARIOToken(amountToDeposit)
              .toMARIO()
              .valueOf()
              .toString(),
          });

          // Wait for deposit to be confirmed
          let newBalance = 0;
          let tries = 0;
          const maxTries = 10;
          while (newBalance < orderPrice && tries < maxTries) {
            try {
              const balanceResult =
                await marketplaceContract.getMarketplaceBalance({
                  address: walletAddress.toString(),
                });
              newBalance = new mARIOToken(Number(balanceResult?.balance ?? 0))
                .toARIO()
                .valueOf();

              if (newBalance >= orderPrice) break;
            } catch (error) {
              console.error('Error checking balance:', error);
            }
            tries++;
            await sleep(5000);
          }

          if (newBalance < orderPrice) {
            throw new Error('Failed to deposit enough ARIO');
          }

          updateWorkflowSteps({
            step: 'deposit',
            status: 'success',
            description: `Deposited ${amountToDeposit} ${arioTicker}`,
          });
        } catch (error) {
          updateWorkflowSteps({
            step: 'deposit',
            status: 'error',
            description: 'Failed to deposit ARIO',
          });
          throw error;
        }
      } else {
        updateWorkflowSteps({
          step: 'deposit',
          status: 'success',
          description: 'Sufficient balance available',
        });
      }

      // Step 2: Execute purchase
      updateWorkflowSteps({
        step: 'buy',
        status: 'processing',
        description: 'Executing purchase...',
      });

      const result = await marketplaceContract.buyFixedPriceANT({
        antId: domainInfo.processId,
      });

      updateWorkflowSteps({
        step: 'buy',
        status: 'success',
        description: 'Purchase complete',
      });

      // Step 3: Complete
      updateWorkflowSteps({
        step: 'complete',
        status: 'success',
        description: 'Name purchased successfully!',
      });

      setWorkflowComplete(true);
      setWorkflowError(false);

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
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });

      eventEmitter.emit('success', {
        name: 'Buy ANT',
        message: (
          <span>
            Successfully bought {name}!
            <br />
            <br />
            <span>View transaction on aolink </span>
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
      setWorkflowComplete(true);
      setWorkflowError(true);
      eventEmitter.emit('error', error);
    } finally {
      setIsBuying(false);
    }
  }

  async function handleCancel() {
    setIsBuying(true);
    setShowProcessing(true);
    setWorkflowComplete(false);
    setWorkflowError(false);
    setWorkflowSteps(defaultCancelWorkflowSteps);

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
        ario: arioContract as AoARIOWrite,
      });

      // Step 1: Cancel the order (or retrieve asset if expired)
      const isRetrievingExpired = isExpired;
      updateWorkflowSteps({
        step: 'cancel',
        status: 'processing',
        description: isRetrievingExpired
          ? 'Retrieving your asset...'
          : 'Cancelling listing...',
      });

      const result = await marketplaceContract.cancelOrder(orderData.id);

      // Wait for the cancellation to be processed/cranked
      await sleep(10_000);

      updateWorkflowSteps({
        step: 'cancel',
        status: 'success',
        description: isRetrievingExpired
          ? 'Asset retrieved'
          : 'Listing cancelled',
      });

      // Step 2: Complete
      updateWorkflowSteps({
        step: 'complete',
        status: 'success',
        description: isRetrievingExpired
          ? 'Your name has been returned to your wallet.'
          : 'Cancellation complete!',
      });

      setWorkflowComplete(true);
      setWorkflowError(false);

      // Invalidate relevant queries
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
      queryClient.resetQueries({
        predicate: (query) =>
          query.queryKey.some(
            (key: unknown) =>
              typeof key === 'string' && key.includes('marketplace'),
          ),
      });

      eventEmitter.emit('success', {
        name: 'Cancel Listing',
        message: (
          <span>
            Successfully cancelled listing for {name}!
            <br />
            <br />
            <span>View transaction on aolink </span>
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
      updateWorkflowSteps({
        step: 'cancel',
        status: 'error',
        description: 'Failed to cancel listing',
      });
      setWorkflowComplete(true);
      setWorkflowError(true);
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

  // Convert price from mARIO to ARIO for display (never show raw mARIO or it can appear as 200k instead of 200)
  const priceInArio = orderData?.price
    ? new mARIOToken(Number(orderData.price)).toARIO().valueOf()
    : 0;
  const priceInUsd =
    arioPrice && typeof arioPrice === 'number' ? priceInArio * arioPrice : null;

  return (
    <div className="page text-white">
      <div>
        {/* Header */}
        {!workflowComplete && (
          <div className="flex items-center gap-4 mb-8">
            {showProcessing ? (
              <span className="text-white cursor-not-allowed flex items-center gap-2 opacity-50">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Marketplace
              </span>
            ) : (
              <Link
                to="/marketplace"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4 fill-white" /> Back to
                Marketplace
              </Link>
            )}
          </div>
        )}

        {/* Expired Warning */}
        {isExpired && (
          <div className="mb-6">
            <WarningCard
              text={
                isUserSeller
                  ? 'This listing has expired. As the lister, you can retrieve your name back to your wallet.'
                  : 'This listing has expired and is no longer available for purchase.'
              }
              wrapperStyle={{ maxWidth: '100%' }}
            />
          </div>
        )}

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

              {/* Domain Details - Hidden during processing */}
              {!showProcessing && (
                <>
                  <div className="flex w-full flex-col border-y-[1px] border-foreground gap-2 py-6 z-10">
                    {orderData?.creator && (
                      <div className="flex items-center justify-between gap-2 text-grey text-sm">
                        <span>Owner:</span>
                        <div className="flex items-end justify-end">
                          <ArweaveID
                            id={
                              isEthAddress(orderData.creator)
                                ? orderData.creator
                                : new ArweaveTransactionID(orderData.creator)
                            }
                            type={ArweaveIdTypes.ADDRESS}
                            shouldLink={isArweaveTransactionID(
                              orderData.creator,
                            )}
                            characterCount={12}
                          />
                        </div>
                      </div>
                    )}

                    {(domainInfo?.undernameCount !== undefined ||
                      domainInfo?.arnsRecord?.undernameLimit != null) && (
                      <div className="text-grey text-sm flex items-center justify-between">
                        <span>Undernames: </span>
                        <span className="text-white flex justify-end items-center">
                          {domainInfo.undernameCount ?? 0}/
                          {domainInfo?.arnsRecord?.undernameLimit ?? 10}
                        </span>
                      </div>
                    )}

                    <div className="text-grey flex items-center justify-between gap-2 text-sm">
                      <span className="whitespace-nowrap">ANT Process: </span>
                      <span className="text-white font-mono flex justify-end">
                        {domainInfo?.processId &&
                        isArweaveTransactionID(domainInfo.processId) ? (
                          <ArweaveID
                            id={new ArweaveTransactionID(domainInfo.processId)}
                            type={ArweaveIdTypes.CONTRACT}
                            shouldLink={true}
                            characterCount={12}
                          />
                        ) : (
                          'N/A'
                        )}
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
                            {new Date(
                              orderData.expirationTime,
                            ).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                  </div>
                </>
              )}

              {/* Buy/Cancel Button / Processing Panel */}
              {!showProcessing ? (
                <>
                  {isExpired && isUserSeller ? (
                    <button
                      className="w-full font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2 mt-8 bg-primary hover:bg-primary-dark text-black"
                      onClick={handleCancel}
                      disabled={isBuying}
                    >
                      {isBuying ? (
                        <>
                          <Loader size={20} />
                          Retrieving...
                        </>
                      ) : (
                        <>
                          <ArrowLeftIcon className="w-5 h-5" />
                          Retrieve your asset
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className={`w-full font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2 mt-8 ${
                        isBuying || isExpired
                          ? 'bg-grey text-white cursor-not-allowed'
                          : isUserSeller
                            ? 'bg-error-thin hover:bg-error text-white'
                            : 'bg-primary hover:bg-warning text-black'
                      }`}
                      onClick={isUserSeller ? handleCancel : handleBuy}
                      disabled={isBuying || isExpired}
                    >
                      {isExpired ? (
                        <>
                          <XIcon className="w-5 h-5" />
                          Listing Expired
                        </>
                      ) : isBuying ? (
                        <>
                          <Loader size={20} />
                          Processing...
                        </>
                      ) : isUserSeller ? (
                        <>
                          <XIcon className="w-5 h-5" />
                          Cancel Listing
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Buy Now
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-4 pt-6">
                  <div className="flex flex-col gap-2 mb-2">
                    <h3 className="text-lg font-medium text-white">
                      {workflowComplete
                        ? workflowError
                          ? isUserSeller
                            ? 'Cancellation Failed'
                            : 'Purchase Failed'
                          : isUserSeller
                            ? 'Listing Cancelled!'
                            : 'Purchase Complete!'
                        : isUserSeller
                          ? 'Cancelling Listing...'
                          : 'Processing Purchase...'}
                    </h3>
                    <p className="text-sm text-grey">
                      {workflowComplete
                        ? workflowError
                          ? 'There was an error completing your purchase.'
                          : `${name} is now yours!`
                        : 'Please wait while we process your purchase. Do not close this page.'}
                    </p>
                  </div>
                  <div className="p-4">
                    {' '}
                    <VerticalTimelineStepper steps={workflowSteps} />
                  </div>

                  {workflowComplete && (
                    <div className="flex gap-3 mt-4">
                      {workflowError ? (
                        <button
                          className="flex-1 bg-transparent border border-grey text-white px-6 py-3 rounded hover:bg-grey hover:bg-opacity-20 transition-colors"
                          onClick={() => {
                            setShowProcessing(false);
                            setWorkflowSteps(defaultBuyWorkflowSteps);
                          }}
                        >
                          Try Again
                        </button>
                      ) : (
                        <Link
                          to={
                            isUserSeller
                              ? `/marketplace`
                              : `/manage/names/${name}`
                          }
                          className="flex-1 bg-primary text-black px-6 py-3 rounded hover:bg-primary-dark transition-colors text-center font-semibold"
                        >
                          {isUserSeller
                            ? 'Back to Marketplace'
                            : 'View Your Name'}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewListing;
