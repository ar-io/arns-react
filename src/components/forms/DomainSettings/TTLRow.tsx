import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModalV2';
import {
  ANT_INTERACTION_TYPES,
  ContractInteraction,
  VALIDATION_INPUT_TYPES,
} from '@src/types';
import { validateTTLSeconds } from '@src/utils';
import { MAX_TTL_SECONDS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TTLRow({
  ttlSeconds,
  confirm,
}: {
  ttlSeconds: number;
  confirm: (ttlSeconds: number) => Promise<ContractInteraction>;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTTL, setNewTTL] = useState<number>(ttlSeconds);
  const [showModal, setShowModal] = useState<boolean>(false);

  async function handleSave(ttl: number) {
    try {
      const res = await confirm(ttl);
      console.debug('deployed', res.id);
    } catch (error) {
      eventEmitter.emit('error', error);
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
              inputCustomStyle={{
                ...(editing
                  ? {
                      background: 'var(--card-bg)',
                      borderRadius: 'var(--corner-radius)',
                      border: '1px solid var(--text-faded)',
                      padding: '15px',
                    }
                  : {
                      border: 'none',
                      background: 'transparent',
                    }),
              }}
              disabled={!editing}
              placeholder={editing ? `Enter a new TTL` : ttlSeconds.toString()}
              value={newTTL}
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
        editable={true}
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => setShowModal(true)}
        onCancel={() => {
          setEditing(false);
          setNewTTL(ttlSeconds);
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
