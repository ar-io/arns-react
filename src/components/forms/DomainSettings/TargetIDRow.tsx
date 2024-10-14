import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import {
  ANT_INTERACTION_TYPES,
  ContractInteraction,
  VALIDATION_INPUT_TYPES,
} from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import { ARNS_TX_ID_ENTRY_REGEX } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function TargetIDRow({
  targetId,
  confirm,
  editable = false,
}: {
  targetId?: string;
  confirm: (targetId: string) => Promise<ContractInteraction>;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newTargetId, setNewTargetId] = useState<string>(targetId ?? '');
  const [{ arweaveDataProvider }] = useGlobalState();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setNewTargetId(targetId ?? '');
  }, [targetId]);

  async function handleSave(transactionId: string) {
    try {
      await confirm(transactionId);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewTargetId(targetId ?? '');
      setShowModal(false);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="Target ID:"
        editable={editable}
        value={
          typeof targetId == 'string' ? (
            !editing && isArweaveTransactionID(targetId) ? (
              <ArweaveID
                id={new ArweaveTransactionID(targetId)}
                shouldLink
                type={ArweaveIdTypes.TRANSACTION}
              />
            ) : (
              <ValidationInput
                customPattern={ARNS_TX_ID_ENTRY_REGEX}
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
                        padding: '3px',
                      }
                    : {
                        border: 'none',
                        background: 'transparent',
                      }
                }
                disabled={!editing}
                placeholder={editing ? `Enter a Target ID` : targetId}
                value={newTargetId}
                setValue={(e) => setNewTargetId(e)}
                validationPredicates={{
                  [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                    fn: (id: string) =>
                      arweaveDataProvider.validateArweaveId(id),
                  },
                }}
                maxCharLength={(str) => str.length <= 43}
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
          setNewTargetId(targetId ?? '');
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newTargetId)}
          interactionType={ANT_INTERACTION_TYPES.SET_TARGET_ID}
          content={
            <>
              <span>
                By completing this action, you are going to change the target ID
                of this token to <br />
                <span className="text-color-warning">
                  {`"${newTargetId}"`}.
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
