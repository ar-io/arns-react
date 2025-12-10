import { AOProcess, ArNSMarketplaceWrite, createAoSigner } from '@ar.io/sdk';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, XIcon } from 'lucide-react';
import { useState } from 'react';
import ContinueWorkflowModal from '../ContinueWorkflowModal/ContinueWorkflowModal';

interface PushIntentModalProps {
  show: boolean;
  onClose: () => void;
  domainName: string;
  antId: string;
  intentId: string;
  onIntentResolved?: () => void;
  isInterrupted?: boolean;
}

function PushIntentModal({
  show,
  onClose,
  domainName,
  antId,
  intentId,
  onIntentResolved,
  isInterrupted = false,
}: PushIntentModalProps) {
  const [{ aoClient, marketplaceProcessId, arioContract }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string | undefined>();
  const [showContinueWorkflowModal, _setShowContinueWorkflowModal] =
    useState<boolean>(false);

  if (!show) return null;

  // If this is an interrupted workflow, show the continue workflow modal instead
  if (isInterrupted && !showContinueWorkflowModal) {
    return (
      <ContinueWorkflowModal
        show={true}
        onClose={onClose}
        domainName={domainName}
        antId={antId}
        intentId={intentId}
        onWorkflowContinued={() => {
          if (onIntentResolved) {
            onIntentResolved();
          }
          onClose();
        }}
      />
    );
  }

  function handleClose() {
    if (!isLoading) {
      onClose();
    }
  }

  async function handlePushIntent() {
    try {
      if (!wallet?.contractSigner) {
        throw new Error('Wallet not found');
      }
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }

      setIsLoading(true);

      const writeMarketplaceContract = new ArNSMarketplaceWrite({
        process: new AOProcess({
          processId: marketplaceProcessId,
          ao: aoClient,
        }),
        signer: createAoSigner(wallet.contractSigner),
        ario: arioContract,
      });

      // Try different possible method names for pushing intent resolution
      let result: any;
      try {
        // First try the expected method name
        if ('pushANTIntentResolution' in writeMarketplaceContract) {
          result = await (
            writeMarketplaceContract as any
          ).pushANTIntentResolution({
            antId,
            intentId,
          });
        } else if ('resolveANTIntent' in writeMarketplaceContract) {
          result = await (writeMarketplaceContract as any).resolveANTIntent({
            antId,
            intentId,
          });
        } else if ('pushIntent' in writeMarketplaceContract) {
          result = await (writeMarketplaceContract as any).pushIntent({
            antId,
            intentId,
          });
        } else {
          throw new Error(
            'Intent resolution method not found on marketplace contract',
          );
        }
      } catch (methodError) {
        // If the method doesn't exist, provide a helpful error message
        throw new Error(
          `Unable to push intent resolution. The marketplace contract may not support this operation yet. Error: ${methodError}`,
        );
      }

      setTransactionId(result.id);
      setIsComplete(true);

      eventEmitter.emit('success', {
        name: 'Intent Resolution Pushed',
        message: (
          <span>
            Successfully pushed intent resolution for {domainName}. The ANT is
            now ready for marketplace operations.
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
      queryClient.invalidateQueries({ queryKey: ['marketplace-user-assets'] });
      queryClient.invalidateQueries({ queryKey: ['domainInfo'] });
      queryClient.invalidateQueries({ queryKey: ['ant'] });

      // Call the callback if provided
      if (onIntentResolved) {
        onIntentResolved();
      }
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
            <Clock className="w-5 h-5" />
            Intent Resolution Required
          </span>
          <button onClick={handleClose} disabled={isLoading}>
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col p-6 gap-4 text-white">
          {/* Domain Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-grey">Name:</span>
              <span className="font-medium">{domainName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-grey">ANT ID:</span>
              <ArweaveID
                id={new ArweaveTransactionID(antId)}
                type={ArweaveIdTypes.TRANSACTION}
                characterCount={8}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-3 p-4 bg-background-secondary rounded-lg border border-dark-grey">
            {!isComplete ? (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">
                    Intent Resolution Pending
                  </span>
                </div>
                <p className="text-sm text-grey">
                  An intent already exists for this ANT. You need to push the
                  intent resolution before you can list this name on the
                  marketplace.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Intent Resolution Complete
                  </span>
                </div>
                <p className="text-sm text-grey">
                  The intent has been successfully resolved. You can now proceed
                  with listing your name on the marketplace.
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
                onClick={handlePushIntent}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isLoading
                    ? 'bg-background text-grey cursor-not-allowed'
                    : 'bg-primary text-black hover:bg-primary-dark'
                }`}
              >
                {isLoading ? 'Pushing Intent...' : 'Push Intent Resolution'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onIntentResolved) {
                    onIntentResolved();
                  }
                  handleClose();
                }}
                className="flex-1 px-4 py-3 rounded-md text-sm font-medium bg-primary text-black hover:bg-primary-dark transition-colors"
              >
                Continue to Listing
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

export default PushIntentModal;
