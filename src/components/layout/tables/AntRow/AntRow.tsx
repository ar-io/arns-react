import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../../../types';
import { ASSET_TYPES } from '../../../../types';
import CopyTextButton from '../../../inputs/buttons/CopyTextButton/CopyTextButton';
import ManageAssetButtons from '../../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import ManageAntModal from '../../../modals/ManageAntModal/ManageAntModal';
import Loader from '../../Loader/Loader';
import TransactionStatus from '../../TransactionStatus/TransactionStatus';

function AntRow({
  antId,
  bgColor,
  textColor,
}: {
  antId: ArweaveTransactionID;
  bgColor: string;
  textColor: string;
}) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const isMobile = useIsMobile();
  const [showManageModal, setShowManageModal] = useState(false);

  const [antState, setAntState] = useState<any>();
  // row details
  const [targetId, setTargetId] = useState<string>();
  const [confirmations, setConfirmations] = useState<number>(0);
  const DEFAULT_ROW_REFRESH_MS = 30000; // 30 seconds;

  // todo: implement error antState for row items
  useEffect(() => {
    loadAntConfirmations(antId).catch((e) =>
      console.error('Failed to fetch confirmations', e),
    );
    loadAntState(antId).catch((e) =>
      console.error('Failed to fetch ANT Contract', e),
    );
  }, [antId]);

  // update confirmations once every 30 seconds
  useEffect(() => {
    const confirmationsInterval = setInterval(() => {
      loadAntConfirmations(antId).catch((e) =>
        console.error('Failed to fetch confirmations', e),
      );
    }, DEFAULT_ROW_REFRESH_MS);
    return () => clearInterval(confirmationsInterval);
  }, []);

  async function loadAntState(id: ArweaveTransactionID) {
    const state = await arweaveDataProvider.getContractState(id);
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

  async function loadAntConfirmations(id: ArweaveTransactionID) {
    const confirmations = await arweaveDataProvider.getTransactionStatus(id);
    setConfirmations(confirmations);
  }
  function setShowModal(show: boolean) {
    setShowManageModal(show);
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
        onClick={
          isMobile
            ? () => setShowManageModal(true)
            : () => {
                return;
              }
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
            className="assets-table-item center"
            style={textColor ? { color: textColor } : {}}
          >
            <CopyTextButton
              displayText={
                isMobile
                  ? `${antId.toString().slice(0, 6)}...${antId
                      .toString()
                      .slice(-6)}`
                  : antId.toString()
              }
              copyText={antId.toString()}
              size={24}
              wrapperStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                textColor: 'var(--bright-white)',
              }}
            />
          </td>
          {isMobile ? (
            <></>
          ) : (
            <td
              className="assets-table-item center"
              style={textColor ? { color: textColor } : {}}
            >
              {targetId ? (
                <CopyTextButton
                  displayText={`${targetId.slice(0, 6)}...${targetId.slice(
                    -6,
                  )}`}
                  copyText={targetId}
                  size={24}
                  wrapperStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    textColor,
                  }}
                />
              ) : (
                <Loader size={30} />
              )}
            </td>
          )}
          <td
            className="assets-table-item center"
            style={textColor ? { color: textColor } : {}}
          >
            <TransactionStatus confirmations={confirmations} />
          </td>
          {isMobile ? (
            <></>
          ) : (
            <td
              className="assets-table-item flex-right"
              style={textColor ? { color: textColor } : {}}
            >
              <ManageAssetButtons
                asset={antId}
                assetType={ASSET_TYPES.ANT}
                setShowModal={setShowModal}
              />
            </td>
          )}
        </>
      </tr>
      {showManageModal ? (
        <ManageAntModal
          setShowModal={setShowModal}
          state={antState}
          contractId={antId}
          targetId={targetId}
          confirmations={confirmations}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default AntRow;
