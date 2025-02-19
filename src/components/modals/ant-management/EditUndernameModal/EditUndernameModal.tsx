import { ANT, AOProcess, AoANTRecord } from '@ar.io/sdk/web';
import { clamp } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { SetRecordPayload, VALIDATION_INPUT_TYPES } from '../../../../types';
import {
  formatForMaxCharCount,
  isArweaveTransactionID,
  isUndernameValid,
  validateTTLSeconds,
} from '../../../../utils';
import {
  ARNS_TX_ID_ENTRY_REGEX,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
} from '../../../../utils/constants';
import eventEmitter from '../../../../utils/events';
import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';
import DialogModal from '../../DialogModal/DialogModal';

function EditUndernameModal({
  antId,
  undername,
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID; // process ID if asset type is a contract interaction
  undername: string;
  closeModal: () => void;
  payloadCallback: (payload: SetRecordPayload) => void;
}) {
  const [{ arweaveDataProvider, antAoClient }] = useGlobalState();
  const isMobile = useIsMobile();
  const targetIdRef = useRef<HTMLInputElement>(null);
  const ttlRef = useRef<HTMLInputElement>(null);
  const [targetId, setTargetId] = useState<string>('');
  const [ttlSeconds, setTtlSeconds] = useState<number>(MIN_TTL_SECONDS);
  const [record, setRecord] = useState<AoANTRecord>();

  useEffect(() => {
    load(antId);
    if (targetIdRef.current) {
      targetIdRef.current.focus();
    }
  }, [antId]);

  async function load(id: ArweaveTransactionID) {
    try {
      const contract = ANT.init({
        process: new AOProcess({
          processId: id.toString(),
          ao: antAoClient,
        }),
      });
      const undernameRecord = await contract.getRecord({
        undername: undername,
      });
      if (!undernameRecord) {
        throw new Error('Undername not found');
      }
      setTargetId(undernameRecord?.transactionId);
      setTtlSeconds(
        clamp(undernameRecord?.ttlSeconds, MIN_TTL_SECONDS, MAX_TTL_SECONDS),
      );
      setRecord(record);
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  function handlePayloadCallback() {
    payloadCallback({
      subDomain: undername,
      transactionId: targetId,
      ttlSeconds,
      previousRecord: record,
    });
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={
          <h2 className="white text-xl">
            Edit {formatForMaxCharCount(undername, 40)}
          </h2>
        }
        body={
          <div
            className="flex flex-column"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <div className="flex flex-column" style={{ paddingBottom: '30px' }}>
              <div className="flex flex-col gap-2">
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
                  customPattern={ARNS_TX_ID_ENTRY_REGEX}
                  validationPredicates={{
                    [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                      fn: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                    },
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
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
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          isArweaveTransactionID(targetId) &&
          isUndernameValid(undername) &&
          ttlSeconds >= MIN_TTL_SECONDS &&
          ttlSeconds <= MAX_TTL_SECONDS
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

export default EditUndernameModal;
