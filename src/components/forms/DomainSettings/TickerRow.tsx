import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { SMARTWEAVE_MAX_INPUT_SIZE } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TickerRow({
  ticker,
  confirm,
}: {
  ticker?: string;
  confirm: (ticker: string) => Promise<ContractInteraction>;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTicker, setNewTicker] = useState<string>(ticker ?? '');
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setNewTicker(ticker ?? '');
  }, [ticker]);

  async function handleSave(name: string) {
    try {
      const res = await confirm(name);
      console.debug('deployed', res.id);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewTicker(ticker ?? '');
      setShowModal(false);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="Ticker:"
        value={
          ticker ? (
            <ValidationInput
              catchInvalidInput={true}
              showValidationIcon={editing}
              onPressEnter={() => setShowModal(true)}
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
              validationPredicates={{}}
              maxCharLength={(str) => str.length <= SMARTWEAVE_MAX_INPUT_SIZE}
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
          setNewTicker('');
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newTicker)}
          interactionType={ANT_INTERACTION_TYPES.SET_TICKER}
          content={
            <>
              <span>
                By completing this action, you are going to change the ticker of
                this token to <br />
                <span className="text-color-warning">{`"${newTicker}"`}.</span>
              </span>
              <span>Are you sure you want to continue?</span>
            </>
          }
        />
      )}
    </>
  );
}
