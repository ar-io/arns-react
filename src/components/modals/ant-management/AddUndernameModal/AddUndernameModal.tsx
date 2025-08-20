import { Tooltip } from '@src/components/data-display';
import { InfoIcon } from '@src/components/icons';
import { useRef, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { SetRecordPayload, VALIDATION_INPUT_TYPES } from '../../../../types';
import {
  isArweaveTransactionID,
  isUndernameValid,
  validateNoLeadingOrTrailingDashes,
  validateNoSpecialCharacters,
  validateTTLSeconds,
} from '../../../../utils';
import {
  ARNS_TX_ID_ENTRY_REGEX,
  LANDING_PAGE_TXID,
  MAX_FULL_ARNS_NAME_LENGTH,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  UNDERNAME_REGEX,
} from '../../../../utils/constants';
import ValidationInput from '../../../inputs/text/ValidationInput/ValidationInput';
import DialogModal from '../../DialogModal/DialogModal';

function AddUndernameModal({
  name,
  closeModal,
  payloadCallback,
}: {
  name: string;
  closeModal: () => void;
  payloadCallback: (payload: SetRecordPayload) => void;
}) {
  const isMobile = useIsMobile();
  const targetIdRef = useRef<HTMLInputElement>(null);
  const ttlRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [undername, setUndername] = useState<string>('');
  const [targetId, setTargetId] = useState<string>(
    LANDING_PAGE_TXID.toString(),
  );
  const [ttlSeconds, setTtlSeconds] = useState<number>(MIN_TTL_SECONDS);
  const maxUndernameLength = MAX_FULL_ARNS_NAME_LENGTH - name.length - 1;

  function handlePayloadCallback() {
    payloadCallback({
      subDomain: undername,
      transactionId: targetId,
      ttlSeconds,
    });
  }

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="white text-xl">Add Undername</h2>}
        body={
          <form>
            <div
              className="flex flex-column"
              style={{ fontSize: '14px', width: '500px' }}
            >
              <div
                className="flex flex-column"
                style={{ paddingBottom: '30px' }}
              >
                <div className="flex flex-col gap-2">
                  <span className="grey">Undername:</span>
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
                      catchInvalidInput={false}
                      maxCharLength={maxUndernameLength}
                      customPattern={UNDERNAME_REGEX}
                      validationPredicates={{
                        [VALIDATION_INPUT_TYPES.UNDERNAME]: {
                          fn: (name: string) =>
                            validateNoSpecialCharacters(name),
                        },
                        'Dashes and Underscores cannot be leading or trailing':
                          {
                            fn: (name) =>
                              validateNoLeadingOrTrailingDashes(name),
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
                      {undername.length} / {maxUndernameLength}
                      {undername.length > 0 ? (
                        <Tooltip
                          message={
                            <span>
                              An ArNS name (undername + base name) can be up to{' '}
                              {MAX_FULL_ARNS_NAME_LENGTH} characters. For base
                              names longer than {maxUndernameLength} characters,
                              this undername will not resolve on AR.IO gateways.
                            </span>
                          }
                          icon={<InfoIcon className="size-4 fill-primary" />}
                        />
                      ) : (
                        <></>
                      )}
                    </span>
                  </span>
                </div>

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
                        fn: async (id: string) => {
                          if (!isArweaveTransactionID(id)) {
                            throw new Error('Invalid Arweave ID');
                          }
                          return true;
                        },
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
          </form>
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          isArweaveTransactionID(targetId) &&
          isUndernameValid(undername) && // only allow adding non-'@' undernames
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

export default AddUndernameModal;
