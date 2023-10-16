import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import {
  ANTMetadata,
  ArweaveTransactionID,
  PDNTContractJSON,
  PDNT_INTERACTION_TYPES,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { getUndernameCount } from '../../../utils';
import eventEmitter from '../../../utils/events';
import { AlertTriangleIcon, CloseIcon } from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import './styles.css';

function TransactionModal({
  transactionType, // todo: add other tx types (ex edit pdnt, IO token management)
  interactionType,
  contractId,
  // todo: implement advanced settings
  // todo: implement smartweave favorites
  state,
  showModal,
}: {
  // main control for how the modal is built
  transactionType: TRANSACTION_TYPES;
  interactionType?: PDNT_INTERACTION_TYPES;
  state?: ANTMetadata;
  contractId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showModal: () => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const [accepted, setAccepted] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [recordCount, setRecordCount] = useState<number>(0);

  // todo: add "transfer to another account" dropdown

  useEffect(() => {
    arweaveDataProvider
      .getContractState<PDNTContractJSON>(contractId)
      .then((state) => {
        const contract = new PDNTContract(state);
        if (!contract.isValid()) {
          throw new Error('Invalid ANT contract');
        }
        const records = getUndernameCount(contract.records);
        setRecordCount(records);
      })
      .catch(() => {
        eventEmitter.emit(
          'error',
          `Failed to get contract state for ${contractId.toString()}`,
        );
        showModal();
      });
  }, [contractId, arweaveDataProvider]);

  return (
    <>
      <div
        className="modal-container"
        style={isMobile ? { padding: 'none' } : {}}
      >
        {/**modal header */}
        <div
          className="flex flex-column card"
          style={
            isMobile
              ? {
                  width: '95%',
                  maxWidth: 'none',
                  height: '95%',
                  padding: 0,
                  boxSizing: 'border-box',
                  gap: '1em',
                }
              : {
                  width: 400,
                  minHeight: 200,
                  padding: 0,
                  paddingBottom: 15,
                  gap: '1em',
                }
          }
        >
          <div
            className="flex flex-column flex-space-between"
            style={{
              borderBottom: '2px rgb(0,0,0,.2) solid',
              padding: 15,
              boxSizing: 'border-box',
              marginTop: 5,
              gap: '.5em',
              position: 'relative',
            }}
          >
            <span
              className="text-medium white bold"
              style={{
                textShadow: '2px 2px 2px rgb(0,0,0)',
              }}
            >
              {transactionType}&nbsp;({interactionType})&nbsp;:&nbsp;
              {state?.state.ticker}
            </span>
            <span className="flex faded text center">
              Contract ID:&nbsp;
              <CopyTextButton
                copyText={contractId ? contractId.toString() : ''}
                body={`${contractId.toString().slice(0, isMobile ? 6 : 0)}${
                  isMobile ? '...' : ''
                }${contractId.toString().slice(isMobile ? -6 : 0)}`}
                size={'70%'}
                wrapperStyle={{
                  fontStyle: 'bold',
                  fontSize: '10px',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                position="relative"
              />
            </span>
            <button className="modal-close-button" onClick={() => showModal()}>
              <CloseIcon
                width="20px"
                height={'20px'}
                fill="var(--text-white)"
              />
            </button>
          </div>
          {/** modal body - condition render edit or transfer */}
          {interactionType === PDNT_INTERACTION_TYPES.TRANSFER ? (
            <div
              className="flex flex-column"
              style={{
                width: '90%',
                height: '100%',
                gap: '1em',
              }}
            >
              {/* todo: show 'transfer between accounts' option */}

              <ValidationInput
                inputClassName="data-input center"
                inputCustomStyle={
                  isValidAddress && toAddress
                    ? {
                        border: '2px solid var(--success-green)',
                      }
                    : !isValidAddress && toAddress
                    ? {
                        border: '2px solid var(--error-red)',
                      }
                    : !isValidAddress && !toAddress && {}
                }
                validationListStyle={{
                  gap: isMobile ? '0.5em' : '1em',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                wrapperClassName="flex flex-column center"
                wrapperCustomStyle={{ gap: isMobile ? '0.5em' : '1em' }}
                placeholder="Enter recipients address"
                maxCharLength={43}
                value={toAddress}
                setValue={setToAddress}
                validityCallback={(validity: boolean) =>
                  setIsValidAddress(validity)
                }
                showValidationChecklist={true}
                validationPredicates={{
                  [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                    fn: (id: string) =>
                      arweaveDataProvider.validateArweaveId(id),
                  },
                }}
              />
              {recordCount ? (
                <span
                  className="flex flex-row"
                  style={{
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <AlertTriangleIcon
                    width={20}
                    height={20}
                    fill={'var(--accent)'}
                  />
                  <span
                    className="text faded"
                    style={{ textAlign: 'left', width: '90%' }}
                  >
                    This PDNT has {`${recordCount} name(s)`} that are associated
                    with it. By transferring this PDNT, you will also be
                    transferring control of those names to the new PDNT holder.
                  </span>
                </span>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}

          {/** abstract the modal functions as much as possible.  */}
          <div className="flex flex-column center" style={{ width: '90%' }}>
            <span
              className="flex flex-row text white"
              style={{
                gap: 10,
                alignItems: 'center',
              }}
            >
              <input
                type="checkbox"
                className="accept-terms"
                checked={accepted}
                onClick={() => setAccepted(!accepted)}
              />
              I understand that this action cannot be undone.
            </span>
            <button
              className="accent-button center"
              disabled={!accepted && isValidAddress}
              style={
                accepted && isValidAddress
                  ? { width: '100%' }
                  : { width: '100%', backgroundColor: 'var(--text-faded)' }
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Show confirmation overlay */}
    </>
  );
}

export default TransactionModal;
