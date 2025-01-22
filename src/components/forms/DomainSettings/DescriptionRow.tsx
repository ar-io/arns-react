import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import {
  ANT_INTERACTION_TYPES,
  ContractInteraction,
  VALIDATION_INPUT_TYPES,
} from '@src/types';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function DescriptionRow({
  description = '',
  confirm,
  editable = false,
}: {
  description?: string;
  confirm: (logo: string) => Promise<ContractInteraction>;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>(
    description ?? '',
  );
  const [{ arweaveDataProvider }] = useGlobalState();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setNewDescription(description ?? '');
  }, [description]);

  async function handleSave(transactionId: string) {
    try {
      await confirm(transactionId);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewDescription(description ?? '');
      setShowModal(false);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="Description:"
        editable={editable}
        value={
          typeof description == 'string' ? (
            !editing ? (
              description
            ) : (
              <ValidationInput
                showValidationIcon={false}
                onPressEnter={() => setShowModal(true)}
                inputClassName={'domain-settings-input'}
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
                placeholder={editing ? `Enter a Description` : description}
                value={newDescription}
                setValue={(e) => setNewDescription(e)}
                validationPredicates={{
                  [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                    fn: (id: string) =>
                      arweaveDataProvider.validateArweaveId(id),
                  },
                }}
                maxCharLength={(str) => str.length <= 512}
              />
            )
          ) : (
            <Skeleton.Input active />
          )
        }
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => setShowModal(true)}
        onCancel={() => {
          setEditing(false);
          setNewDescription(description ?? '');
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newDescription)}
          interactionType={ANT_INTERACTION_TYPES.SET_DESCRIPTION}
          content={
            <>
              <span className="max-w-[32rem]">
                By completing this action, you are going to change the
                Description of this token to <br />
                <span className="text-color-warning break-all max-w-[32rem]">
                  {`"${newDescription}"`}.
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
