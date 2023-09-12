import {
  INTERACTION_TYPES,
  PDNTInteractionType,
  PDNT_INTERACTION_TYPES,
  TransactionDataPayload,
  ValidInteractionType,
} from '../../../types';
import DialogModal from '../DialogModal/DialogModal';

const TITLE_MAP: Record<PDNT_INTERACTION_TYPES, string> = {
  [PDNT_INTERACTION_TYPES.SET_NAME]: 'Edit Nickname',
  [PDNT_INTERACTION_TYPES.SET_TICKER]: 'Edit Ticker',
  [PDNT_INTERACTION_TYPES.SET_TARGET_ID]: 'Edit Target ID',
  [PDNT_INTERACTION_TYPES.SET_TTL_SECONDS]: 'Edit TTL Seconds',
  [PDNT_INTERACTION_TYPES.SET_CONTROLLER]: 'Edit ANT ID',
  [PDNT_INTERACTION_TYPES.SET_RECORD]: 'Edit Undername',
  [PDNT_INTERACTION_TYPES.REMOVE_RECORD]: 'Remove Undername',
  [PDNT_INTERACTION_TYPES.REMOVE_CONTROLLER]: 'Edit Lease Duration',
  [PDNT_INTERACTION_TYPES.TRANSFER]: 'Transfer ANT',
};

function ConfirmTransactionModal({
  interactionType,
  payload,
}: {
  interactionType: PDNT_INTERACTION_TYPES;
  payload: TransactionDataPayload;
}) {
  return (
    <div className="modal-container">
      <DialogModal title={TITLE_MAP[interactionType]} />
    </div>
  );
}

export default ConfirmTransactionModal;
