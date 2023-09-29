import { useEffect, useRef, useState } from 'react';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  SetRecordPayload,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  getAssociatedNames,
  isArweaveTransactionID,
  isPDNSDomainNameValid,
  validateNoSpecialCharacters,
  validateTTLSeconds,
} from '../../../utils';
import {
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  PDNS_TX_ID_ENTRY_REGEX,
  UNDERNAME_REGEX,
} from '../../../utils/constants';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import TransactionCost from '../../layout/TransactionCost/TransactionCost';
import DialogModal from '../DialogModal/DialogModal';

function AddUndernameModal({
  antId,
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // contract ID if asset type is a contract interaction
  closeModal: () => void;
  payloadCallback: (payload: SetRecordPayload) => void;
}) {
  const [{ pdnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const [state, setState] = useState<PDNTContractJSON>();
  const [maxUndernameLength, setMaxUndernameLength] = useState(61);

  const targetIdRef = useRef<HTMLInputElement>(null);
  const ttlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [associatedNames, setAssociatedNames] = useState<string[]>([]);
  const [undername, setUndername] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [ttlSeconds, setTtlSeconds] = useState<number>(MIN_TTL_SECONDS);

  useEffect(() => {
    arweaveDataProvider.getContractState(antId).then((stateRes) => {
      setState(stateRes as PDNTContractJSON);
      const nameRes = getAssociatedNames(
        antId,
        pdnsSourceContract.records,
      ).reduce((acc: string[], curr) => {
        if (curr) {
          acc.push(curr);
        }
        return acc;
      }, []);
      if (nameRes.length) {
        nameRes.sort((a, b) => a.length - b.length);
        setAssociatedNames(nameRes);
        setMaxUndernameLength(Math.max(0, 61 - nameRes[0].length));
      }
    });

    nameRef.current?.focus();
  }, [antId]);

  function handlePayloadCallback() {
    payloadCallback({
      subDomain: undername,
      transactionId: targetId,
      ttlSeconds,
    });
  }

  if (!state) {
    return (
      <div className="modal-container">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="white">Add Undername</h2>}
        body={
          <form>
            <div
              className="flex flex-column"
              style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
            >
              <div
                className="flex flex-column"
                style={{ gap: '10px', marginBottom: '20px' }}
              >
                <span className="grey">Name</span>
                <span className="white">{associatedNames[0]}</span>
              </div>
              <div
                className="flex flex-column"
                style={{ paddingBottom: '30px' }}
              >
                <div className="flex flex-column" style={{ gap: '15px' }}>
                  <span className="grey">Undername Title:</span>
                  <span
                    className="flex flex-row"
                    style={{ position: 'relative' }}
                  >
                    <ValidationInput
                      key={'undername'}
                      ref={nameRef}
                      inputClassName="name-token-input white"
                      inputCustomStyle={{
                        paddingLeft: '10px',
                        fontSize: '14px',
                        paddingRight: '80px',
                      }}
                      wrapperCustomStyle={{
                        width: '100%',
                        border: '1px solid var(--text-faded)',
                        borderRadius: 'var(--corner-radius)',
                      }}
                      showValidationIcon={true}
                      showValidationOutline={true}
                      showValidationChecklist={true}
                      validationListStyle={{ display: 'none' }}
                      value={undername}
                      setValue={(v: string) => setUndername(v)}
                      catchInvalidInput={true}
                      maxCharLength={maxUndernameLength}
                      customPattern={UNDERNAME_REGEX}
                      validationPredicates={{
                        [VALIDATION_INPUT_TYPES.UNDERNAME]: {
                          fn: (name: string) =>
                            validateNoSpecialCharacters(name),
                        },
                      }}
                    />
                    <span
                      className="flex flex-row grey"
                      style={{
                        position: 'absolute',
                        top: '0px',
                        bottom: '0px',
                        right: undername.length ? '35px' : '10px',
                        width: 'fit-content',
                      }}
                    >
                      {undername.length}/{maxUndernameLength}
                    </span>
                  </span>
                </div>

                <div className="flex flex-column" style={{ gap: '15px' }}>
                  <span className="grey">Target ID:</span>
                  <ValidationInput
                    key={'targetId'}
                    ref={targetIdRef}
                    inputClassName="name-token-input white"
                    inputCustomStyle={{
                      paddingLeft: '10px',
                      fontSize: '14px',
                      paddingRight: '40px',
                    }}
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
                    value={targetId}
                    setValue={setTargetId}
                    catchInvalidInput={true}
                    customPattern={PDNS_TX_ID_ENTRY_REGEX}
                    validationPredicates={{
                      [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                        fn: (id: string) =>
                          arweaveDataProvider.validateArweaveId(id),
                      },
                    }}
                  />
                </div>

                <div className="flex flex-column" style={{ gap: '15px' }}>
                  <span className="grey">TTL:</span>
                  <ValidationInput
                    key={'ttlSeconds'}
                    ref={ttlRef}
                    inputClassName="name-token-input white"
                    inputCustomStyle={{ paddingLeft: '10px', fontSize: '14px' }}
                    wrapperCustomStyle={{
                      position: 'relative',
                      border: '1px solid var(--text-faded)',
                      borderRadius: 'var(--corner-radius)',
                      maxWidth: '130px',
                    }}
                    showValidationIcon={true}
                    showValidationOutline={true}
                    showValidationChecklist={true}
                    type="number"
                    minNumber={MIN_TTL_SECONDS}
                    maxNumber={MAX_TTL_SECONDS}
                    validationListStyle={{ display: 'none' }}
                    maxCharLength={MAX_TTL_SECONDS.toString().length}
                    value={ttlSeconds}
                    setValue={(v: string) => setTtlSeconds(+v)}
                    catchInvalidInput={true}
                    customPattern={
                      new RegExp(
                        `^[0-9]{1,${MAX_TTL_SECONDS.toString().length}}$`,
                      )
                    }
                    validationPredicates={{
                      [VALIDATION_INPUT_TYPES.VALID_TTL]: {
                        fn: (ttl: string) => validateTTLSeconds(+ttl),
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </form>
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          isArweaveTransactionID(targetId) &&
          isPDNSDomainNameValid({ name: undername }) &&
          ttlSeconds >= MIN_TTL_SECONDS &&
          ttlSeconds <= MAX_TTL_SECONDS
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
        nextText="Next"
        cancelText="Cancel"
      />
    </div>
  );
}

export default AddUndernameModal;
