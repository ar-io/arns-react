import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import {
  ARNS_TX_ID_ENTRY_REGEX,
  SMARTWEAVE_MAX_INPUT_SIZE,
} from '@src/utils/constants';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TargetIDRow({ targetId }: { targetId: string }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTargetId, setNewTargetId] = useState<string>('');
  const [{ arweaveDataProvider }] = useGlobalState();

  function handleSave(transactionId: string) {}
  return (
    <>
      <DomainSettingsRow
        label="Target ID:"
        value={
          <ValidationInput
            customPattern={ARNS_TX_ID_ENTRY_REGEX}
            catchInvalidInput={true}
            showValidationIcon={true}
            onPressEnter={() => handleSave(newTargetId)}
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
            placeholder={editing ? `Enter a Target ID` : targetId}
            value={newTargetId}
            setValue={(e) => setNewTargetId(e)}
            validationPredicates={{
              [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                fn: (id: string) => arweaveDataProvider.validateArweaveId(id),
              },
            }}
            maxCharLength={(str) => str.length <= 43}
          />
        }
        editable={true}
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => handleSave(newTargetId)}
        onCancel={() => {
          setEditing(false);
          setNewTargetId('');
        }}
      />
    </>
  );
}
