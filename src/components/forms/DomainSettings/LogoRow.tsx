import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import LogoUploadModal from '@src/components/modals/LogoUploadModal/LogoUploadModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { ContractInteraction } from '@src/types';
import { isArweaveTransactionID } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { Skeleton } from '@src/components/ui/Skeleton';
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
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  async function handleUpdateSuccess(txId: string) {
    setIsConfirming(true);
    try {
      await confirm(txId);
      setIsConfirming(false);
      setShowUpdateModal(false);
      eventEmitter.emit('success', {
        name: 'Logo Updated',
        message: `Logo updated successfully with ID: ${txId}`,
      });
    } catch (error) {
      setIsConfirming(false);
      eventEmitter.emit('error', error);
      // Keep modal open so user can retry
      throw error; // Re-throw to let modal handle the error display
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
          typeof logoTxId === 'string' ? (
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
            <Skeleton className="h-4 w-48 bg-surface" />
          )
        }
      />
      <LogoUploadModal
        show={showUpdateModal}
        onClose={() => {
          if (!isConfirming) {
            setShowUpdateModal(false);
          }
        }}
        onUpdateSuccess={handleUpdateSuccess}
        currentLogoTxId={logoTxId}
      />
    </>
  );
}
