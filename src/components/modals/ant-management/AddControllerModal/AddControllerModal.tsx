import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ANTContractJSON, VALIDATION_INPUT_TYPES } from '../../../../types';
import {
  formatForMaxCharCount,
  isArweaveTransactionID,
} from '../../../../utils';
import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';
import TransactionCost from '../../../layout/TransactionCost/TransactionCost';
import DialogModal from '../../DialogModal/DialogModal';

function AddControllerModal({
  antId,
  state,
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  state: ANTContractJSON;
  closeModal: () => void;
  payloadCallback: (payload: { controller: string }) => void;
}) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const isMobile = useIsMobile();
  const [newController, setNewController] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();

  useEffect(() => {
    if (!newController.length) {
      setIsValidAddress(undefined);
      return;
    }
  }, [newController]);

  function handlePayloadCallback() {
    payloadCallback({
      controller: newController,
    });
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="white">Add Controller</h2>}
        body={
          <div
            className="flex flex-column"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <div className="flex flex-column" style={{ gap: '10px' }}>
              <span className="grey">Contract ID:</span>
              <span className="white">{antId.toString()}</span>
            </div>
            <div className="flex flex-column" style={{ gap: '10px' }}>
              <span className="grey">Nickname:</span>
              <span className="white">
                {formatForMaxCharCount(state.name, 40)}
              </span>
            </div>
            <div className="flex flex-column" style={{ paddingBottom: '30px' }}>
              <div className="flex flex-column" style={{ gap: '10px' }}>
                <span className="grey">Controller wallet address:</span>
                <ValidationInput
                  inputClassName="name-token-input white"
                  inputCustomStyle={{ paddingLeft: '10px', fontSize: '16px' }}
                  wrapperCustomStyle={{
                    position: 'relative',
                    border: '1px solid var(--text-faded)',
                    borderRadius: 'var(--corner-radius)',
                  }}
                  showValidationIcon={true}
                  showValidationOutline={true}
                  showValidationChecklist={true}
                  validationListStyle={{ display: 'none' }}
                  catchInvalidInput={true}
                  maxCharLength={43}
                  value={newController}
                  setValue={setNewController}
                  validityCallback={(validity: boolean) =>
                    setIsValidAddress(validity)
                  }
                  validationPredicates={{
                    [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                      fn: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                    },
                  }}
                />
                <span className="text-color-error">
                  {isValidAddress === false ? 'invalid address' : ''}
                </span>
              </div>
            </div>
          </div>
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          isArweaveTransactionID(newController)
            ? () => handlePayloadCallback()
            : undefined
        }
        footer={
          <div className="flex">
            <TransactionCost
              fee={{}}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
              showBorder={false}
            />
          </div>
        }
        nextText="Add"
        cancelText="Cancel"
      />
    </div>
  );
}

export default AddControllerModal;
