import {
  ANT,
  AOProcess,
  ArNSMarketplaceWrite,
  createAoSigner,
  mARIOToken,
} from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import MarketplaceOrderInfoCard, {
  MarketplaceOrderConfig,
} from '@src/components/cards/MarketplaceOrderInfoCard';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useANTIntent } from '@src/hooks/useANTIntent';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import useDomainInfo from '@src/hooks/useDomainInfo';
import { useMarketplaceOrder } from '@src/hooks/useMarketplaceOrder';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import { ANT_INTERACTION_TYPES } from '@src/types';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface ContinueWorkflowModalProps {
  show: boolean;
  onClose: () => void;
  domainName: string;
  antId: string;
  intentId: string;
}

enum InterruptedWorkflowTypes {
  // used to indicate the ANT was not transferred to the marketplace - predicated by marketplace == ant owner
  // if owner !== market and !== user, its a bad order.
  // To fix, we must transfer the ANT to the marketplace with the correct intent ID.
  TRANSFER = 'transfer',
  // used to indicate the credit notice was not pushed to the marketplace - predicated by marketplace == ant owner and Push-ANT-Intent-Resolution will be used to fix.
  PUSH_INTENT = 'push_intent',
}

function ContinueWorkflowModal({
  show,
  onClose,
  domainName,
  antId,
  intentId,
}: ContinueWorkflowModalProps) {
  const [
    {
      marketplaceProcessId,
      antAoClient,
      hyperbeamUrl,
      aoClient,
      arioContract,
      arioTicker,
      arioProcessId,
    },
  ] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string | undefined>();

  // Get domain info to check ANT state
  const { data: domainInfo } = useDomainInfo({ antId });

  // Check for existing marketplace order
  const { data: marketplaceOrder, error: orderError } = useMarketplaceOrder({
    antId,
  });

  // Get the intent data to show order configuration
  const { marketplaceIntent } = useANTIntent(antId);
  const { data: arIoPrice } = useArIoPrice();

  // Create order configuration from intent data
  const orderConfig: MarketplaceOrderConfig | null = useMemo(() => {
    if (!marketplaceIntent?.orderParams) return null;

    // Extract order parameters from the intent
    const { orderParams } = marketplaceIntent;

    const listingType = orderParams.orderType || 'fixed';
    const price = orderParams.price ? Number(orderParams.price) : 0;
    const expirationDate = orderParams.expirationTime
      ? new Date(Number(orderParams.expirationTime))
      : undefined;

    return {
      listingType: listingType as 'fixed' | 'dutch' | 'english',
      price,
      arioTicker,
      arIoPrice,
      expirationDate,
      // Add auction-specific fields if available
      startingPrice: orderParams.price
        ? Number(orderParams.price) / 1000000
        : undefined, // For dutch auctions, price is the starting price
      reservePrice: orderParams.minimumPrice
        ? Number(orderParams.minimumPrice) / 1000000
        : undefined,
      decrementInterval: orderParams.decreaseInterval
        ? Number(orderParams.decreaseInterval) / (1000 * 60 * 60)
        : undefined, // Convert ms to hours
      decrementAmount: undefined, // This would need to be calculated based on price difference and intervals
    };
  }, [marketplaceIntent, arioTicker, arIoPrice]);

  // Determine workflow type based on ANT state and marketplace order
  const workflowType = useMemo(() => {
    if (!domainInfo?.state?.Owner || !walletAddress) {
      return null;
    }

    const antOwner = domainInfo.state.Owner;
    const userAddress = walletAddress.toString();

    // If ANT is owned by marketplace and there's no order, need to push intent
    if (
      antOwner === marketplaceProcessId &&
      (!marketplaceOrder || orderError)
    ) {
      return InterruptedWorkflowTypes.PUSH_INTENT;
    }

    // If ANT is still owned by user, need to transfer
    if (antOwner === userAddress) {
      return InterruptedWorkflowTypes.TRANSFER;
    }

    // Unknown state - could be owned by someone else
    return null;
  }, [
    domainInfo,
    marketplaceOrder,
    orderError,
    marketplaceProcessId,
    walletAddress,
  ]);

  if (!show) return null;

  function handleClose() {
    if (!isLoading) {
      onClose();
    }
  }

  // Auto-close modal after successful completion
  function handleWorkflowCompleted() {
    setTimeout(() => {
      onClose();
    }, 3000); // Give user time to see success message
  }

  async function handleContinueWorkflow() {
    try {
      if (!wallet?.contractSigner) {
        throw new Error('Wallet not found');
      }
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }
      if (!workflowType) {
        throw new Error('Unable to determine workflow type');
      }

      setIsLoading(true);

      const marketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract as any, // Cast to avoid type issues
      });

      let result: any;
      switch (workflowType) {
        case InterruptedWorkflowTypes.TRANSFER: {
          // Transfer the ANT to the marketplace with the X-Intent-Id tag
          const antProcess = ANT.init({
            hyperbeamUrl,
            process: new AOProcess({ processId: antId, ao: antAoClient }),
            signer: createAoSigner(wallet.contractSigner),
          });

          // Create write options with the X-Intent-Id tag
          const writeOptionsWithIntent = {
            ...WRITE_OPTIONS,
            tags: [
              ...(WRITE_OPTIONS.tags || []),
              { name: 'X-Intent-Id', value: intentId },
            ],
          };

          result = await antProcess.transfer(
            { target: marketplaceProcessId },
            writeOptionsWithIntent,
          );
          break;
        }
        case InterruptedWorkflowTypes.PUSH_INTENT: {
          // Push intent resolution to marketplace
          result = await marketplaceContract.pushANTIntentResolution(intentId);
          // we need to poll for the change and react to it

          const retries = 0;
          const maxRetries = 10;
          while (retries < maxRetries) {
            try {
              const _res = await marketplaceContract.getUserAssets({
                address: walletAddress.toString(),
                arioProcessId,
              });
            } catch {
              console.error('Issue retrieving marketplace assets');
            }
          }
          queryClient.resetQueries({
            predicate: (query) => {
              return query.queryKey.includes('marketplace');
            },
          });
          break;
        }
        default:
          throw new Error('Unable to determine workflow type');
      }

      setTransactionId(result.id);
      setIsComplete(true);

      const actionMessage =
        workflowType === InterruptedWorkflowTypes.TRANSFER
          ? 'The ANT has been transferred to the marketplace with the correct intent ID.'
          : 'The intent has been pushed to the marketplace for resolution.';

      eventEmitter.emit('success', {
        name: 'Workflow Continued',
        message: (
          <span>
            Successfully continued the interrupted workflow for {domainName}.{' '}
            {actionMessage}
            <br />
            <br />
            <span>
              View transaction on aolink{' '}
              <ArweaveID
                id={new ArweaveTransactionID(result.id)}
                type={ArweaveIdTypes.INTERACTION}
              />
            </span>
          </span>
        ),
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('marketplace'),
      });

      // Auto-close modal after success
      handleWorkflowCompleted();
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-container relative">
      <div className="flex flex-col rounded bg-metallic-grey border border-dark-grey gap-2 w-[32rem] overflow-hidden">
        {/* Header */}
        <div className="flex w-full p-6 py-4 text-white border-b border-dark-grey justify-between">
          <span className="flex gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Interrupted Workflow Detected
          </span>
          <button onClick={handleClose} disabled={isLoading}>
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col p-6 gap-4 text-white">
          {/* Workflow Type Detection */}
          {workflowType && (
            <div className="flex flex-col gap-3 p-4 bg-blue-900/20 rounded-lg border border-dark-grey">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">
                  Workflow Analysis
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-grey whitespace-nowrap">ANT Owner:</span>
                <ArweaveID
                  id={new ArweaveTransactionID(domainInfo?.state?.Owner || '')}
                  type={ArweaveIdTypes.ADDRESS}
                  characterCount={8}
                />
                <ArrowRight className="w-3 h-3 text-grey" />
                <span className="text-grey">Expected:</span>
                <ArweaveID
                  id={new ArweaveTransactionID(marketplaceProcessId)}
                  type={ArweaveIdTypes.ADDRESS}
                  characterCount={8}
                />
              </div>
              <div className="text-xs text-grey">
                Marketplace Order: {marketplaceOrder ? 'Found' : 'Not Found'}
              </div>
            </div>
          )}
          {/* Order Configuration from Intent */}
          {orderConfig && (
            <MarketplaceOrderInfoCard config={orderConfig} name={domainName} />
          )}

          {/* Status */}
          <div className="flex flex-col gap-3 p-4 border rounded border-dark-grey">
            {!isComplete ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">
                    {workflowType === InterruptedWorkflowTypes.TRANSFER
                      ? 'ANT Transfer Required'
                      : workflowType === InterruptedWorkflowTypes.PUSH_INTENT
                        ? 'Intent Resolution Required'
                        : 'Workflow Interruption Detected'}
                  </span>
                </div>
                <p className="text-sm text-grey">
                  {workflowType === InterruptedWorkflowTypes.TRANSFER
                    ? 'The ANT is still owned by you but has a pending marketplace intent. The ANT needs to be transferred to the marketplace to complete the listing.'
                    : workflowType === InterruptedWorkflowTypes.PUSH_INTENT
                      ? 'The ANT has been transferred to the marketplace but has not been processed and requires resolution. Continuing the workflow will push a state notice to inform the marketplace the ANT has been transferred to it.'
                      : 'A marketplace listing workflow was interrupted for this ANT. Please check the ANT ownership and marketplace order status.'}
                </p>
                <div className="text-xs text-grey">
                  Intent ID:{' '}
                  <code className="bg-dark-grey px-1 rounded">{intentId}</code>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Workflow Continued Successfully
                  </span>
                </div>
                <p className="text-sm text-grey">
                  The interrupted workflow has been successfully continued. The
                  ANT has been transferred to the marketplace with the correct
                  intent ID.
                </p>
                {transactionId && (
                  <div className="text-xs text-grey">
                    Transaction ID:{' '}
                    <ArweaveID
                      id={new ArweaveTransactionID(transactionId)}
                      type={ArweaveIdTypes.INTERACTION}
                      characterCount={12}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="flex gap-2">
            {!isComplete ? (
              <button
                onClick={handleContinueWorkflow}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isLoading
                    ? 'bg-background text-grey cursor-not-allowed'
                    : 'bg-warning text-black hover:bg-warning-dark'
                }`}
              >
                {isLoading ? 'Continuing Workflow...' : 'Continue Workflow'}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-md text-sm font-medium bg-success text-black hover:bg-success-dark transition-colors"
              >
                Done
              </button>
            )}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-3 rounded-md text-sm font-medium bg-background-secondary text-white hover:bg-dark-grey transition-colors border border-dark-grey"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContinueWorkflowModal;
