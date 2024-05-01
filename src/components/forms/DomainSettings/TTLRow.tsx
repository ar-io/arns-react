import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { ARNS_TX_ID_ENTRY_REGEX } from '@src/utils/constants';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TTLRow({ ttlSeconds }: { ttlSeconds: number }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTTL, setNewTTL] = useState<number>(ttlSeconds);

  function handleSave(ttl: number) {}
  return (
    <>
      <DomainSettingsRow
        label="TTL Seconds:"
        value={
          <ValidationInput
            catchInvalidInput={true}
            showValidationIcon={true}
            onPressEnter={() => handleSave(newTTL)}
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
        onSave={() => handleSave(newTTL)}
        onCancel={() => {
          setEditing(false);
          setNewTTL(ttlSeconds);
        }}
      />
    </>
  );
}
