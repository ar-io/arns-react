import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { defaultDataProvider } from '../../../../services/arweave';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ASSET_TYPES, ArweaveTransactionId } from '../../../../types';
import CopyTextButton from '../../../inputs/buttons/CopyTextButton/CopyTextButton';
import ManageAssetButtons from '../../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import Loader from '../../Loader/Loader';
import TransactionStatus from '../../TransactionStatus/TransactionStatus';

function AntRow({
  antId,
  bgColor,
  textColor,
}: {
  antId: ArweaveTransactionId;
  bgColor: string;
  textColor: string;
}) {
  const [{ arweave }] = useGlobalState();
  const isMobile = useIsMobile();
  const [antState, setAntState] = useState<any>();
  // row details
  const [targetId, setTargetId] = useState<string>();
  const [confirmations, setConfirmations] = useState<number>(0);

  const dataProvider = defaultDataProvider(arweave);

  // todo: implement error antState for row items
  useEffect(() => {
    loadAntConfirmations(antId).catch((e) =>
      console.error('Failed to fetch confirmations', e),
    );
    loadAntState(antId).catch((e) =>
      console.error('Failed to fetch confirmations', e),
    );
  }, [antId]);

  async function loadAntState(id: string) {
    const state = await dataProvider.getContractState(id);
    setAntState(state);
    if (state.records['@'].transactionId) {
      setTargetId(antState.records['@'].transactionId);
    }
    // todo: remove below for v1, this is a legacy format for ant record antStates.
    if (typeof state.records['@'] === 'string') {
      setTargetId(state.records['@']);
    }
    return;
  }

  async function loadAntConfirmations(id: string) {
    const confirmations = await dataProvider.getContractConfirmations(id);
    setConfirmations(confirmations);
  }

  return (
    <>
      <tr
        className="assets-table-header"
        style={
          bgColor
            ? {
                backgroundColor: bgColor,
                color: textColor,
              }
            : {}
        }
      >
        <>
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
          >
            {antState?.name ? (
              antState.name.length > 20 ? (
                `${antState.name.slice(0, 10)}...${antState.name.slice(-10)}`
              ) : (
                antState.name
              )
            ) : (
              <Loader size={30} />
            )}
          </td>
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
          >
            {isMobile ? (
              <CopyTextButton
                displayText={`${antId.slice(0, 2)}...${antId.slice(-2)}`}
                copyText={antId}
                size={24}
              />
            ) : (
              <CopyTextButton
                displayText={`${antId.slice(0, 6)}...${antId.slice(-6)}`}
                copyText={antId}
                size={24}
              />
            )}
          </td>
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
          >
            {targetId ? (
              isMobile ? (
                <CopyTextButton
                  displayText={`${targetId.slice(0, 2)}...${targetId.slice(
                    -2,
                  )}`}
                  copyText={targetId}
                  size={24}
                />
              ) : (
                <CopyTextButton
                  displayText={`${targetId.slice(0, 6)}...${targetId.slice(
                    -6,
                  )}`}
                  copyText={targetId}
                  size={24}
                />
              )
            ) : (
              <Loader size={30} />
            )}
          </td>
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
          >
            <TransactionStatus confirmations={confirmations} />
          </td>
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
          >
            <ManageAssetButtons asset={antId} assetType={ASSET_TYPES.ANT} />
          </td>
        </>
      </tr>
    </>
  );
}

export default AntRow;
