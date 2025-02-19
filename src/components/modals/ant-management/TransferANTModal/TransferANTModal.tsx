import { useANT } from '@src/hooks/useANT/useANT';
import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { TransferANTPayload, VALIDATION_INPUT_TYPES } from '../../../../types';
import { formatForMaxCharCount, isValidAoAddress } from '../../../../utils';
import { InfoIcon } from '../../../icons';
import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';
import DialogModal from '../../DialogModal/DialogModal';
import './styles.css';

function TransferANTModal({
  antId,
  closeModal,
  payloadCallback,
  associatedNames,
}: {
  antId: ArweaveTransactionID; // process ID if asset type is a contract interaction
  closeModal: () => void;
  payloadCallback: (payload: TransferANTPayload) => void;
  associatedNames: string[];
}) {
  const isMobile = useIsMobile();
  const [accepted, setAccepted] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const { name = 'N/A' } = useANT(antId.toString());

  useEffect(() => {
    if (!isValidAoAddress(toAddress)) {
      setAccepted(false);
    }
    if (!toAddress.length) {
      setIsValidAddress(undefined);
      return;
    }
  }, [toAddress]);

  function handlePayloadCallback() {
    payloadCallback({
      target: toAddress,
      associatedNames,
    });
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="white text-xl">Transfer ANT</h2>}
        body={
          <div
            className="flex flex-column"
            style={{ fontSize: '14px', maxWidth: '575px' }}
          >
            <div className="flex flex-column" style={{ gap: '10px' }}>
              <span className="grey">Process ID:</span>
              <span className="white">{antId.toString()}</span>
            </div>
            <div className="flex flex-column" style={{ gap: '10px' }}>
              <span className="grey">Nickname:</span>
              <span className="white">{formatForMaxCharCount(name, 40)}</span>
            </div>
            <div className="flex flex-column" style={{ paddingBottom: '30px' }}>
              <div className="flex flex-column" style={{ gap: '15px' }}>
                <span className="grey">Recipient wallet address:</span>
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
                  maxCharLength={43}
                  value={toAddress}
                  setValue={setToAddress}
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
                {isValidAddress === false ? (
                  <span
                    className="text-color-error"
                    style={{ marginBottom: '10px' }}
                  >
                    invalid address
                  </span>
                ) : (
                  <></>
                )}

                {associatedNames.length ? (
                  <span
                    className="warning-container flex flex-row"
                    style={{
                      boxSizing: 'border-box',
                      fontSize: 'inherit',
                      gap: '10px',
                    }}
                  >
                    <InfoIcon
                      width={'24px'}
                      height={'24px'}
                      fill={'var(--accent)'}
                      style={{
                        height: 'fit-content',
                        width: '40px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        lineHeight: '150%',
                      }}
                    />
                    <span style={{}}>
                      {`This ANT has ${associatedNames.length} name${
                        associatedNames.length > 1 ? 's' : ''
                      } that ${
                        associatedNames.length > 1 ? 'are' : 'is'
                      } associated with it. By transferring this ANT, you
                  will also be transferring control of those names to the new
                  ANT holder.`}
                    </span>
                  </span>
                ) : (
                  <></>
                )}

                <span
                  className={`flex flex-row text-sm ${
                    accepted ? 'white' : 'grey'
                  }`}
                  style={{
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <Checkbox
                    rootClassName="accept-checkbox"
                    onChange={(e) => setAccepted(e.target.checked)}
                    checked={accepted && isValidAoAddress(toAddress)}
                    style={{ color: 'white' }}
                    disabled={!isValidAoAddress(toAddress)}
                  />
                  I understand that this action cannot be undone.
                </span>
              </div>
            </div>
          </div>
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          accepted && isValidAoAddress(toAddress)
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
        nextText="Next"
        cancelText="Cancel"
      />
    </div>
  );
}

export default TransferANTModal;
