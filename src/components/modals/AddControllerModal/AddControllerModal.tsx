import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  PDNTContractJSON,
  SetControllerPayload,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { formatForMaxCharCount, isArweaveTransactionID } from '../../../utils';
import eventEmitter from '../../../utils/events';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import DialogModal from '../DialogModal/DialogModal';

function AddControllerModal({
  antId,
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  closeModal: () => void;
  payloadCallback: (payload: SetControllerPayload) => void;
}) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const isMobile = useIsMobile();
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [state, setState] = useState<PDNTContractJSON>();

  // TODO: add "transfer to another account" dropdown

  useEffect(() => {
    load(antId);
  }, [antId]);

  async function load(id: ArweaveTransactionID) {
    try {
      const contractState =
        await arweaveDataProvider.getContractState<PDNTContractJSON>(id);
      const pendingContractInteractions =
        await arweaveDataProvider.getPendingContractInteractions(
          id,
          id.toString(),
        );
      const contract = new PDNTContract(
        contractState,
        id,
        pendingContractInteractions,
      );
      setState(contract.state);
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  useEffect(() => {
    if (!toAddress.length) {
      setIsValidAddress(undefined);
      return;
    }
  }, [toAddress]);

  if (!state) {
    return (
      <div className="modal-container">
        <Loader size={80} />
      </div>
    );
  }

  function handlePayloadCallback() {
    payloadCallback({
      target: toAddress,
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
                  value={toAddress}
                  setValue={setToAddress}
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
          isArweaveTransactionID(toAddress)
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
