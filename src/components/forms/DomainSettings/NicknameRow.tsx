import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import {
  ANT_INTERACTION_TYPES,
  ContractInteraction,
  VALIDATION_INPUT_TYPES,
} from '@src/types';
import { validateMaxASCIILength } from '@src/utils';
import { SMARTWEAVE_MAX_INPUT_SIZE } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { useEffect, useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function NicknameRow({
  nickname,
  confirm,
}: {
  nickname?: string;
  confirm: (name: string) => Promise<ContractInteraction>;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>(nickname ?? '');
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setNewNickname(nickname ?? '');
  }, [nickname]);

  async function handleSave(name: string) {
    try {
      await confirm(name);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewNickname(nickname ?? '');
      setShowModal(false);
    }
  }

  return (
    <>
      <DomainSettingsRow
        label="Nickname:"
        value={
          <ValidationInput
            catchInvalidInput={true}
            showValidationIcon={editing}
            onPressEnter={() => setShowModal(true)}
            inputClassName={'domain-settings-input'}
            inputCustomStyle={
              editing
                ? {
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--corner-radius)',
                    border: '1px solid var(--text-faded)',
                    padding: '15px',
                  }
                : {
                    border: 'none',
                    background: 'transparent',
                  }
            }
            disabled={!editing}
            placeholder={editing ? `Enter a name` : nickname}
            value={newNickname}
            setValue={(e) => setNewNickname(e)}
            validationPredicates={{
              [VALIDATION_INPUT_TYPES.VALID_ANT_NAME]: {
                fn: (name: any) =>
                  validateMaxASCIILength(name, SMARTWEAVE_MAX_INPUT_SIZE),
              },
            }}
            maxCharLength={(str) => str.length <= SMARTWEAVE_MAX_INPUT_SIZE}
          />
        }
        editable={true}
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => setShowModal(true)}
        onCancel={() => {
          setEditing(false);
          setNewNickname(nickname ?? '');
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newNickname)}
          interactionType={ANT_INTERACTION_TYPES.SET_NAME}
          content={
            <>
              <span>
                By completing this action, you are going to change the name of
                this token to <br />
                <span className="text-color-warning">
                  {`"${newNickname}"`}.
                </span>
              </span>
              <span>Are you sure you want to continue?</span>
            </>
          }
        />
      )}
    </>
  );
}
