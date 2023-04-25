import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ANTContractJSON,
  ANT_INTERACTION_TYPES,
  ArNSRecordEntry,
  ArweaveTransactionID,
  CONTRACT_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { getTransactionPayloadByInteractionType } from '../../../utils';
import { AlertTriangleIcon, CloseIcon } from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import './styles.css';

function TransactionModal({
  antId,
  showModal,
}: {
  // main control for how the modal is built
  antId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  showModal: () => void;
}) {
  const [{ arnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{}, dispatchTransactionState] = useTransactionState();
  const isMobile = useIsMobile();
  const [accepted, setAccepted] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const [state, setState] = useState<ANTContractJSON>();
  const navigate = useNavigate();

  // todo: add "transfer to another account" dropdown

  useEffect(() => {
    arweaveDataProvider
      .getContractState(antId)
      .then((res) => setState(res as ANTContractJSON));
  }, [antId]);

  function getAssociatedNames(txId: ArweaveTransactionID) {
    return Object.entries(arnsSourceContract.records)
      .map(([name, recordEntry]: [string, ArNSRecordEntry]) => {
        if (recordEntry.contractTxId === txId.toString()) return name;
      })
      .filter((n) => !!n);
  }

  if (!state) {
    return (
      <div className="modal-container">
        <Loader size={200} />
      </div>
    );
  }

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
              className="text-small white bold"
              style={{
                textShadow: '2px 2px 2px rgb(0,0,0)',
              }}
            >
              Transfer ANT:&nbsp;{state.ticker ?? state.name}
            </span>
            <span className="flex faded text center">
              Contract ID:&nbsp;
              <CopyTextButton
                copyText={antId ? antId.toString() : ''}
                displayText={`${antId!.toString().slice(0, isMobile ? 6 : 0)}${
                  isMobile ? '...' : ''
                }${antId!.toString().slice(isMobile ? -6 : 0)}`}
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
              maxLength={43}
              value={toAddress}
              setValue={setToAddress}
              validityCallback={(validity: boolean) =>
                setIsValidAddress(validity)
              }
              showValidationChecklist={true}
              validationPredicates={{
                [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                  arweaveDataProvider.validateArweaveId(id),
              }}
            />
            {getAssociatedNames(antId!).length ? (
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
                  This ANT has {`${getAssociatedNames(antId!).length} name(s)`}{' '}
                  that are associated with it. By transferring this ANT, you
                  will also be transferring control of those names to the new
                  ANT holder.
                </span>
              </span>
            ) : (
              <></>
            )}
          </div>
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
              onClick={() => {
                const payload = getTransactionPayloadByInteractionType(
                  CONTRACT_TYPES.ANT,
                  ANT_INTERACTION_TYPES.TRANSFER,
                  toAddress.toString()!,
                );

                if (payload) {
                  const { assetId, functionName, ...data } = payload; // eslint-disable-line
                  dispatchTransactionState({
                    type: 'setContractType',
                    payload: CONTRACT_TYPES.ANT,
                  });
                  dispatchTransactionState({
                    type: 'setInteractionType',
                    payload: ANT_INTERACTION_TYPES.TRANSFER,
                  });
                  dispatchTransactionState({
                    type: 'setTransactionData',
                    payload: {
                      assetId: antId.toString()!,
                      functionName,
                      ...data,
                    },
                  });
                  navigate(`/transaction`, { state: '/' });
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransactionModal;
