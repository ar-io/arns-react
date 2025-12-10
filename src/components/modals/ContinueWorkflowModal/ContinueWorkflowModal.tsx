import { ANT, AOProcess, createAoSigner } from '@ar.io/sdk';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState, useWalletState } from '@src/state';
import { ANT_INTERACTION_TYPES } from '@src/types';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, XIcon } from 'lucide-react';
import { useState } from 'react';

interface ContinueWorkflowModalProps {
  show: boolean;
  onClose: () => void;
  domainName: string;
  antId: string;
  intentId: string;
  onWorkflowContinued?: () => void;
}

function ContinueWorkflowModal({
  show,
  onClose,
  domainName,
  antId,
  intentId,
  onWorkflowContinued,
}: ContinueWorkflowModalProps) {
  const [{ marketplaceProcessId, antAoClient, hyperbeamUrl }] =
    useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string | undefined>();

  if (!show) return null;

  function handleClose() {
    if (!isLoading) {
      onClose();
    }
  }

  async function handleContinueWorkflow() {
    try {
      if (!wallet?.contractSigner) {
        throw new Error('Wallet not found');
      }
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }

      setIsLoading(true);

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

      const result = await antProcess.transfer(
        { target: marketplaceProcessId },
        writeOptionsWithIntent,
      );

      setTransactionId(result.id);
      setIsComplete(true);

      eventEmitter.emit('success', {
        name: 'Workflow Continued',
        message: (
          <span>
            Successfully continued the interrupted workflow for {domainName}.
            The ANT has been transferred to the marketplace with the correct
            intent ID.
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
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });

      // Call the callback if provided
      if (onWorkflowContinued) {
        onWorkflowContinued();
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
            <AlertTriangle className="w-5 h-5 text-warning" />
            Interrupted Workflow Detected
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
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">
                    Workflow Interruption Detected
                  </span>
                </div>
                <p className="text-sm text-grey">
                  It appears that a marketplace listing workflow was interrupted
                  for this ANT. The ANT is still owned by you but has a pending
                  intent. You can continue the workflow by transferring the ANT
                  to the marketplace with the correct intent ID.
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
                onClick={() => {
                  if (onWorkflowContinued) {
                    onWorkflowContinued();
                  }
                  handleClose();
                }}
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
