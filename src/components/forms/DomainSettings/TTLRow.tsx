import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import {
  ANT_INTERACTION_TYPES,
  ContractInteraction,
  VALIDATION_INPUT_TYPES,
} from '@src/types';
import { validateTTLSeconds } from '@src/utils';
import {
  DEFAULT_TTL_SECONDS,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TTLRow({
  ttlSeconds,
  confirm,
  editable = false,
}: {
  ttlSeconds?: number;
  confirm: (ttlSeconds: number) => Promise<ContractInteraction>;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTTL, setNewTTL] = useState<number>(
    ttlSeconds ?? DEFAULT_TTL_SECONDS,
  );
  const [showModal, setShowModal] = useState<boolean>(false);

  async function handleSave(ttl: number) {
    try {
      await confirm(ttl);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewTTL(ttl ?? DEFAULT_TTL_SECONDS);
      setShowModal(false);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="TTL Seconds:"
        value={
          ttlSeconds ? (
            <ValidationInput
              catchInvalidInput={true}
              showValidationIcon={editing}
              onPressEnter={() => setShowModal(true)}
              inputClassName={'domain-settings-input'}
              inputType="number"
              inputCustomStyle={
                editing
                  ? {
                      background: 'var(--card-bg)',
                      borderRadius: 'var(--corner-radius)',
                      border: '1px solid var(--text-faded)',
                      padding: '3px',
                    }
                  : {
                      border: 'none',
                      background: 'transparent',
                    }
              }
              disabled={!editing}
              placeholder={editing ? `Enter a new TTL` : ttlSeconds.toString()}
              value={editing ? newTTL : ttlSeconds}
              setValue={(e) => setNewTTL(parseInt(e.toString()))}
              validationPredicates={{
                [VALIDATION_INPUT_TYPES.VALID_TTL]: {
                  fn: (ttl: number) => validateTTLSeconds(ttl),
                },
              }}
              maxCharLength={(ttl) =>
                ttl.toString().length <= MAX_TTL_SECONDS.toString().length
              }
            />
          ) : (
            <Skeleton.Input active={true} />
          )
        }
        editable={editable}
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => {
          try {
            if (newTTL > MAX_TTL_SECONDS || newTTL < MIN_TTL_SECONDS)
              throw new Error(VALIDATION_INPUT_TYPES.VALID_TTL);
            setShowModal(true);
          } catch (error) {
            eventEmitter.emit('error', error);
          }
        }}
        onCancel={() => {
          setEditing(false);
          setNewTTL(ttlSeconds ?? DEFAULT_TTL_SECONDS);
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newTTL)}
          interactionType={ANT_INTERACTION_TYPES.SET_TTL_SECONDS}
          content={
            <>
              <span>
                By completing this action, you are going to change the TTL
                seconds of this token to <br />
                <span className="text-color-warning">{`"${newTTL}"`}.</span>
              </span>
              <span>Are you sure you want to continue?</span>
            </>
          }
        />
      )}
    </>
  );
}
