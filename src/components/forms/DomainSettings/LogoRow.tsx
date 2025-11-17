import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import LogoUploadModal from '@src/components/modals/LogoUploadModal/LogoUploadModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { ContractInteraction } from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useState } from 'react';

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
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  async function handleUpdateSuccess(txId: string) {
    setShowUpdateModal(false);
    try {
      await confirm(txId);
      eventEmitter.emit('success', {
        name: 'Logo Updated',
        message: `Logo updated successfully with ID: ${txId}`,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }
  return (
    <>
      <DomainSettingsRow
        label="Logo"
        editable={editable}
        action={
          editable ? (
            <button
              className="p-[6px] px-[10px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap hover:scale-105"
              onClick={() => setShowUpdateModal(true)}
            >
              Update Logo
            </button>
          ) : null
        }
        value={
          typeof logoTxId == 'string' ? (
            isArweaveTransactionID(logoTxId) ? (
              // TODO: render the logo in a tooltip
              <ArweaveID
                id={new ArweaveTransactionID(logoTxId)}
                shouldLink
                characterCount={16}
                type={ArweaveIdTypes.TRANSACTION}
              />
            ) : (
              <span className="text-grey">No logo set</span>
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
      />
      <LogoUploadModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdateSuccess={handleUpdateSuccess}
        currentLogoTxId={logoTxId}
      />
    </>
  );
}
