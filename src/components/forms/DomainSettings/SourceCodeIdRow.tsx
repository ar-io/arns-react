import { ANT_LUA_ID } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import UpgradeAntModal from '@src/components/modals/ant-management/UpgradeAntModal/UpgradeAntModal';
import { useANTLuaSourceCode } from '@src/hooks/useANTLuaSourceCode';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

export default function SourceCodeIdRow({
  sourceCodeTxId,
  editable,
  antId,
}: {
  antId?: string;
  sourceCodeTxId?: string;
  editable: boolean;
}) {
  const { data } = useANTLuaSourceCode();
  const [showUpgradeAntModal, setShowUpgradeAntModal] = useState(false);
  return (
    <>
      <DomainSettingsRow
        label="Source Code TX ID:"
        editable={true}
        value={
          <span
            className="flex center"
            style={{
              justifyContent: 'flex-start',
              gap: '10px',
            }}
          >
            {sourceCodeTxId ? (
              <ArweaveID
                id={new ArweaveTransactionID(sourceCodeTxId)}
                shouldLink
                type={ArweaveIdTypes.TRANSACTION}
              />
            ) : (
              'N/A'
            )}
          </span>
        }
        action={
          editable &&
          sourceCodeTxId &&
          ![ANT_LUA_ID, data?.originalTxId]
            .filter((id) => id !== undefined)
            .includes(sourceCodeTxId) && [
            <Tooltip
              key={1}
              message={'Your ANT requires an update'}
              icon={
                <button
                  onClick={() => setShowUpgradeAntModal(true)}
                  className="h-fit animate-pulse whitespace-nowrap rounded-[4px] bg-primary-thin px-3 py-[5px] text-[13px] text-primary transition-all hover:bg-primary hover:text-black"
                >
                  Upgrade ANT
                </button>
              }
            />,
          ]
        }
      />
      {antId && (
        <UpgradeAntModal
          antId={antId}
          visible={showUpgradeAntModal}
          setVisible={(b: boolean) => setShowUpgradeAntModal(b)}
        />
      )}
    </>
  );
}
