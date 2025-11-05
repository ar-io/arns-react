import { Tooltip } from '@src/components/data-display';
import { AntLogoIcon } from '@src/components/data-display/AntLogoIcon';
import { UploadIcon } from '@src/components/icons';
import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import UploadLogoModal from '@src/components/modals/UploadLogoModal/UploadLogoModal';
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

export default function LogoRow({
  logoTxId,
  confirm,
  editable = false,
}: {
  logoTxId?: string;
  confirm: (logo: string) => Promise<ContractInteraction>;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newLogoTxId, setNewLogoTxId] = useState<string>(logoTxId ?? '');
  const [{ arweaveDataProvider }] = useGlobalState();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showUploadLogoModal, setShowUploadLogoModal] =
    useState<boolean>(false);

  useEffect(() => {
    setNewLogoTxId(logoTxId ?? '');
  }, [logoTxId]);

  async function handleSave(transactionId: string) {
    try {
      await confirm(transactionId);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewLogoTxId(logoTxId ?? '');
      setShowModal(false);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="Logo"
        editable={editable}
        value={
          typeof logoTxId === 'string' ? (
            !editing && isArweaveTransactionID(logoTxId) ? (
              <Tooltip
                key={1}
                message={
                  <AntLogoIcon
                    id={logoTxId}
                    className="h-16 w-16 md:w-20 md:h-20"
                  />
                }
                icon={
                  <>
                    <ArweaveID
                      id={new ArweaveTransactionID(logoTxId)}
                      shouldLink
                      characterCount={16}
                      type={ArweaveIdTypes.TRANSACTION}
                    />
                  </>
                }
              />
            ) : (
              <div className="flex w-full items-center gap-2 md:gap-4">
                <ValidationInput
                  customPattern={ARNS_TX_ID_ENTRY_REGEX}
                  catchInvalidInput={true}
                  showValidationIcon={editing}
                  onPressEnter={() => setShowModal(true)}
                  wrapperClassName="flex w-full"
                  inputClassName={'domain-settings-input flex w-full'}
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
                  placeholder={editing ? `Enter a Logo ID` : logoTxId}
                  value={newLogoTxId}
                  setValue={(e) => setNewLogoTxId(e)}
                  validationPredicates={{
                    [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                      fn: (id: string) =>
                        arweaveDataProvider.validateArweaveId(id),
                    },
                  }}
                  maxCharLength={(str) => str.length <= 43}
                />
                <span className="text-base">or</span>
                <Tooltip
                  key={1}
                  message={'Upload new logo'}
                  icon={
                    <button
                      className="fill-grey hover:fill-white"
                      onClick={() => {
                        setShowUploadLogoModal(true);
                      }}
                    >
                      <UploadIcon
                        width={'18px'}
                        height={'18px'}
                        fill="inherit"
                      />
                    </button>
                  }
                />
              </div>
            )
          ) : (
            <Skeleton.Input
              active
              style={{
                backgroundColor: 'var(--card-bg)',
                height: '16px',
              }}
            />
          )
        }
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => {
          if (!isArweaveTransactionID(newLogoTxId)) {
            eventEmitter.emit('error', {
              name: 'Set Logo',
              message: 'Logo must be an arweave transaction ID',
            });
            return;
          }
          setShowModal(true);
        }}
        onCancel={() => {
          setEditing(false);
          setNewLogoTxId(logoTxId ?? '');
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newLogoTxId)}
          interactionType={ANT_INTERACTION_TYPES.SET_LOGO}
          content={
            <>
              <span>
                By completing this action, you are going to change the Logo TX
                ID of this token to <br />
                <span className="text-color-warning">
                  {`"${newLogoTxId}"`}.
                </span>
              </span>
              <span>Are you sure you want to continue?</span>
            </>
          }
        />
      )}

      {showUploadLogoModal && (
        <UploadLogoModal
          close={() => setShowUploadLogoModal(false)}
          confirm={handleSave}
        />
      )}
    </>
  );
}
