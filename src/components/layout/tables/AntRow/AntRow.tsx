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

  const dataProvider = defaultDataProvider(arweave);

  // todo: implement error antState for row items
  useEffect(() => {
    loadAntState();
  }, [antId]);

  useEffect(() => {
    if (antState) {
      getTargetId();
    }
  }, [antState]);

  async function loadAntState() {
    const state = await dataProvider.getContractState(antId);
    setAntState(state);
    return;
  }

  function getTargetId() {
    if (antState.records['@'].transactionId) {
      setTargetId(antState.records['@'].transaction);
    }
    // todo: remove below for v1, this is a legacy format for ant record antStates.
    if (typeof antState.records['@'] === 'string') {
      setTargetId(antState.records['@']);
    }
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
            <TransactionStatus id={antId} />
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
