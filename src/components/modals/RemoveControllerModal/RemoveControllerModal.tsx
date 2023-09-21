import { Table } from 'antd';
import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  SetControllerPayload,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { formatForMaxCharCount, isArweaveTransactionID } from '../../../utils';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import DialogModal from '../DialogModal/DialogModal';

function RemoveControllersModal({
  antId,
  showModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showModal: () => void;
  payloadCallback: (payload: SetControllerPayload) => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [state, setState] = useState<PDNTContractJSON>();

  // TODO: add "transfer to another account" dropdown

  useEffect(() => {
    arweaveDataProvider
      .getContractState(antId)
      .then((res) => setState(res as PDNTContractJSON));
  }, [antId]);

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
                <Table columns={[]} dataSource={[]} />
              </div>
            </div>
          </div>
        }
        onCancel={() => showModal()}
        onClose={() => showModal()}
        onNext={
          isArweaveTransactionID(toAddress)
            ? () => handlePayloadCallback()
            : () => alert('You must accept the terms to continue.')
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
        nextText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
}

export default RemoveControllersModal;
