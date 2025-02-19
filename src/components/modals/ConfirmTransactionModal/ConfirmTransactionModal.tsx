import { ANT_INTERACTION_TYPES } from '../../../types';
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
}: {
  interactionType: ANT_INTERACTION_TYPES;
  content?: React.ReactNode;
  cancel: () => void;
  confirm: () => void;
  fee?: Record<string, number>;
  cancelText?: string;
  confirmText?: string;
}) {
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
        nextText={confirmText}
        cancelText={cancelText}
        onNext={confirm}
        footer={
          <div style={{ width: 'fit-content' }}>
            {/* <TransactionCost
              fee={fee}
              showBorder={false}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
            /> */}
          </div>
        }
      />
    </div>
  );
}

export default ConfirmTransactionModal;
