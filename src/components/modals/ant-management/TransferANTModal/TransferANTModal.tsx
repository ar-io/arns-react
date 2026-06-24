import { SolanaGasDetails } from '@src/components/data-display/SolanaGasDetails';
import { useANT } from '@src/hooks/useANT/useANT';
import { useAntGasEstimate } from '@src/hooks/useAntGasEstimate';
import { useSolBalance } from '@src/hooks/useSolBalance';
import { Checkbox } from 'antd';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { SolanaAddress } from '../../../../services/solana/SolanaAddress';
import { TransferANTPayload, VALIDATION_INPUT_TYPES } from '../../../../types';
import { formatForMaxCharCount, isValidSolanaAddress } from '../../../../utils';
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
  // ANT mint pubkey (Solana base58) or, on legacy AO, an Arweave tx id.
  // The component only calls `.toString()` on it.
  antId: ArweaveTransactionID | SolanaAddress;
  closeModal: () => void;
  payloadCallback: (payload: TransferANTPayload) => void;
  associatedNames: string[];
}) {
  const isMobile = useIsMobile();
  const [accepted, setAccepted] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const { name = 'N/A' } = useANT(antId.toString());

  // Live network-cost quote once the recipient is known: the sender pays
  // to bootstrap the recipient's ACL registry accounts (~0.06 SOL) when
  // they've never owned an ANT; otherwise just the transaction fee.
  const { data: gasEstimate, isLoading: isLoadingGas } = useAntGasEstimate({
    processId: antId.toString(),
    workflow: isValidSolanaAddress(toAddress)
      ? { workflow: 'transfer', recipient: toAddress }
      : undefined,
  });
  const { data: solBalance } = useSolBalance();
  const insufficientSol =
    !!gasEstimate &&
    solBalance !== undefined &&
    solBalance < gasEstimate.totalLamports;

  useEffect(() => {
    if (!isValidSolanaAddress(toAddress)) {
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
              <span className="grey">Token Address:</span>
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
                  inputId="transfer-ant-target-input"
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
                  maxCharLength={44}
                  value={toAddress}
                  setValue={setToAddress}
                  validityCallback={(validity: boolean) =>
                    setIsValidAddress(validity)
                  }
                  validationPredicates={{
                    [VALIDATION_INPUT_TYPES.AO_ADDRESS]: {
                      fn: async (id: string) => {
                        if (!isValidSolanaAddress(id)) {
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
                    rootClassName="accept-checkbox transfer-ant-accept-checkbox"
                    onChange={(e) => setAccepted(e.target.checked)}
                    checked={accepted && isValidSolanaAddress(toAddress)}
                    style={{ color: 'white' }}
                    disabled={!isValidSolanaAddress(toAddress)}
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
          accepted && isValidSolanaAddress(toAddress) && !insufficientSol
            ? () => handlePayloadCallback()
            : undefined
        }
        footer={
          <div className="flex">
            {isValidSolanaAddress(toAddress) && (
              <SolanaGasDetails
                gasEstimate={gasEstimate}
                isLoading={isLoadingGas}
                insufficientSol={insufficientSol}
              />
            )}
          </div>
        }
        nextText={insufficientSol ? 'Insufficient SOL' : 'Next'}
        cancelText="Cancel"
      />
    </div>
  );
}

export default TransferANTModal;
