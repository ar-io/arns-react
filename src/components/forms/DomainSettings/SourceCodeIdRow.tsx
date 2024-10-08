import { Tooltip } from '@src/components/data-display';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import UpgradeAntModal from '@src/components/modals/ant-management/UpgradeAntModal/UpgradeAntModal';
import { useANTLuaSourceCode } from '@src/hooks/useANTLuaSourceCode';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { isArweaveTransactionID } from '@src/utils';
import { DEFAULT_ANT_LUA_ID } from '@src/utils/constants';
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
            {sourceCodeTxId && isArweaveTransactionID(sourceCodeTxId) ? (
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
          // editable controls if user has permission to upgrade
          editable &&
          // if source code id is defined and a txid check if its a valid version
          ((sourceCodeTxId &&
            isArweaveTransactionID(sourceCodeTxId) &&
            ![DEFAULT_ANT_LUA_ID, data?.originalTxId]
              .filter((id) => id !== undefined)
              .includes(sourceCodeTxId)) ||
            // if no source code ID we need to upgrade it.
            !isArweaveTransactionID(sourceCodeTxId)) && [
            <Tooltip
              key={1}
              message={'Your ANT requires an update'}
              icon={
                <button
                  onClick={() => setShowUpgradeAntModal(true)}
                  className="p-[6px] px-[10px] text-[12px] rounded-[4px] bg-primary-thin hover:bg-primary border hover:border-primary border-primary-thin text-primary hover:text-black transition-all whitespace-nowrap"
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
