import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { validateMaxASCIILength } from '@src/utils';
import { SMARTWEAVE_MAX_INPUT_SIZE } from '@src/utils/constants';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function NicknameRow({ nickname }: { nickname: string }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>('');

  function handleSave(newName: string) {}
  return (
    <>
      <DomainSettingsRow
        label="Nickname:"
        value={
          <ValidationInput
            catchInvalidInput={true}
            showValidationIcon={true}
            onPressEnter={() => handleSave(newNickname)}
            inputClassName={'domain-settings-input'}
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
        onSave={() => handleSave(newNickname)}
        onCancel={() => {
          setEditing(false);
          setNewNickname('');
        }}
      />
    </>
  );
}
