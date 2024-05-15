import { ANTState } from '@ar.io/sdk/web';
import { ANTCard } from '@src/components/cards';
import { TransferANTModal } from '@src/components/modals';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function OwnerRow({
  confirm,
  contractTxId,
  state,
  associatedNames,
}: {
  contractTxId: string;
  associatedNames: string[];
  state?: ANTState;
  confirm: ({ target }: { target: string }) => Promise<ContractInteraction>;
}) {
  const [payload, setTransactionData] = useState<{
    target: ArweaveTransactionID;
    associatedNames?: string[];
  }>();
  const [showTransferANTModal, setShowTransferANTModal] =
    useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  async function handleTransferANT(payload: { target: ArweaveTransactionID }) {
    try {
      await confirm({ target: payload.target.toString() });
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setShowConfirmModal(false);
    }
  }

  return (
    <>
      <DomainSettingsRow
        label="Owner:"
        value={state?.owner ?? <Skeleton.Input active />}
        action={[
          <button
            key={1}
            onClick={() => setShowTransferANTModal(true)}
            disabled={!state}
            className="button-secondary"
            style={{
              padding: '9px 12px',
              fontSize: '13px',
              boxSizing: 'border-box',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}
          >
            Transfer
          </button>,
        ]}
      />
      {showTransferANTModal && state && (
        <TransferANTModal
          closeModal={() => setShowTransferANTModal(false)}
          antId={new ArweaveTransactionID(contractTxId)}
          state={state}
          associatedNames={associatedNames}
          payloadCallback={(payload) => {
            setTransactionData({
              target: new ArweaveTransactionID(payload.target.toString()),
              associatedNames: payload.associatedNames,
            });
            setShowConfirmModal(true);
            setShowTransferANTModal(false);
          }}
        />
      )}
      {showConfirmModal && payload && (
        <ConfirmTransactionModal
          cancel={() => setShowConfirmModal(false)}
          confirm={() => handleTransferANT(payload)}
          interactionType={ANT_INTERACTION_TYPES.TRANSFER}
          content={
            <span className="flex" style={{ maxWidth: '500px' }}>
              <ANTCard
                domain={payload.associatedNames?.[0] ?? ''}
                mobileView
                contractTxId={new ArweaveTransactionID(contractTxId)}
                overrides={{
                  'New Owner': payload.target.toString(),
                }}
                compact={false}
                disabledKeys={[
                  'maxUndernames',
                  'owner',
                  'controller',
                  'ttlSeconds',
                ]}
              />
            </span>
          }
        />
      )}
    </>
  );
}
