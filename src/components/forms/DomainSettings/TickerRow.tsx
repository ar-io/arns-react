import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { VALIDATION_INPUT_TYPES } from '@src/types';
import { SMARTWEAVE_MAX_INPUT_SIZE } from '@src/utils/constants';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TickerRow({ ticker }: { ticker: string }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTicker, setNewTicker] = useState<string>('');
  const [{ arweaveDataProvider }] = useGlobalState();

  function handleSave(newTicker: string) {}
  return (
    <>
      <DomainSettingsRow
        label="Ticker:"
        value={
          <ValidationInput
            catchInvalidInput={true}
            showValidationIcon={true}
            onPressEnter={() => handleSave(newTicker)}
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
            placeholder={editing ? `Enter a Ticker` : ticker}
            value={newTicker}
            setValue={(e) => setNewTicker(e)}
            validationPredicates={{
              [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                fn: (id: string) => arweaveDataProvider.validateArweaveId(id),
              },
            }}
            maxCharLength={(str) => str.length <= SMARTWEAVE_MAX_INPUT_SIZE}
          />
        }
        editable={true}
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => handleSave(newTicker)}
        onCancel={() => {
          setEditing(false);
          setNewTicker('');
        }}
      />
    </>
  );
}
