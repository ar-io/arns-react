import {
  AntGasWorkflowParams,
  useAntGasEstimate,
} from '@src/hooks/useAntGasEstimate';
import { useSolBalance } from '@src/hooks/useSolBalance';

import { ANT_INTERACTION_TYPES } from '../../../types';
import { SolanaGasDetails } from '../../data-display/SolanaGasDetails';
import DialogModal from '../DialogModal/DialogModal';

function ConfirmTransactionModal({
  interactionType,
  content = (
    <span>{`Are you sure you want to ${interactionType.toLowerCase()}?`}</span>
  ),
  cancel,
  confirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  gasParams,
}: {
  interactionType: ANT_INTERACTION_TYPES;
  content?: React.ReactNode;
  cancel: () => void;
  confirm: () => void;
  fee?: Record<string, number>;
  cancelText?: string;
  confirmText?: string;
  /**
   * When provided, the footer shows the Solana network cost (and any rent
   * reclaimed by closes) for the action, and the confirm button is gated
   * on the wallet holding enough SOL.
   */
  gasParams?: { processId?: string; workflow: AntGasWorkflowParams };
}) {
  const { data: gasEstimate, isLoading: isLoadingGas } = useAntGasEstimate({
    processId: gasParams?.processId,
    workflow: gasParams?.workflow,
  });
  const { data: solBalance } = useSolBalance();
  const insufficientSol =
    !!gasEstimate &&
    solBalance !== undefined &&
    solBalance < gasEstimate.totalLamports;

  return (
    <div className="modal-container">
      <DialogModal
        title={<h2 className="white text-xl">{interactionType}</h2>}
        body={
          <div
            className="flex flex-column white text-sm"
            style={{
              gap: '20px',
              padding: '15px 0px',
              paddingTop: '0px',
            }}
          >
            {content}
          </div>
        }
        onCancel={cancel}
        onClose={cancel}
        nextText={insufficientSol ? 'Insufficient SOL' : confirmText}
        cancelText={cancelText}
        onNext={insufficientSol ? undefined : confirm}
        footer={
          <div style={{ width: 'fit-content' }}>
            {gasParams && (
              <SolanaGasDetails
                gasEstimate={gasEstimate}
                isLoading={isLoadingGas && !!gasParams.processId}
                insufficientSol={insufficientSol}
              />
            )}
          </div>
        }
      />
    </div>
  );
}

export default ConfirmTransactionModal;
