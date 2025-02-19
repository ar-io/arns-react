import { useANT } from '@src/hooks/useANT/useANT';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { VALIDATION_INPUT_TYPES } from '../../../../types';
import { formatForMaxCharCount, isValidAoAddress } from '../../../../utils';
import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';
import DialogModal from '../../DialogModal/DialogModal';

function AddControllerModal({
  antId,
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // process ID if asset type is a contract interaction
  closeModal: () => void;
  payloadCallback: (payload: { controller: string }) => void;
}) {
  const isMobile = useIsMobile();
  const [newController, setNewController] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const { name = 'N/A' } = useANT(antId.toString());

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
        title={<h2 className="white text-xl">Add Controller</h2>}
        body={
          <div
            className="flex flex-column"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <div className="flex flex-col gap-2">
              <span className="grey">Process ID:</span>
              <span className="white">{antId.toString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="grey">Nickname:</span>
              <span className="white">{formatForMaxCharCount(name, 40)}</span>
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
                    [VALIDATION_INPUT_TYPES.AO_ADDRESS]: {
                      fn: async (id: string) => {
                        if (!isValidAoAddress(id)) {
                          throw new Error('Invalid address');
                        }
                      },
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
          isValidAoAddress(newController)
            ? () => handlePayloadCallback()
            : undefined
        }
        footer={
          <div className="flex">
            {/* <TransactionCost
              fee={{}}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
              showBorder={false}
            /> */}
          </div>
        }
        nextText="Add"
        cancelText="Cancel"
      />
    </div>
  );
}

export default AddControllerModal;
