import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ArNSContractState, ArweaveTransactionID } from '../../../../types';
import { ASSET_TYPES } from '../../../../types';
import { RefreshAlertIcon } from '../../../icons';
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
  const [confirmations, setConfirmations] = useState<number>();
  const [errors, setErrors] = useState<{
    ant: Error | undefined;
    confirmations: Error | undefined;
  }>({
    ant: undefined,
    confirmations: undefined,
  });
  const DEFAULT_ROW_REFRESH_MS = 30000; // 30 seconds;

  // todo: implement error antState for row items
  useEffect(() => {
    loadAntState(antId);
    loadAntConfirmations(antId);
    // update confirmations once every 30 seconds
    const confirmationsInterval = setInterval(() => {
      loadAntConfirmations(antId);
    }, DEFAULT_ROW_REFRESH_MS);
    return () => clearInterval(confirmationsInterval);
  }, [antId]);

  async function loadAntState(id: ArweaveTransactionID) {
    setErrors({
      ...errors,
      ant: undefined,
    });
    try {
      const state = await arweaveDataProvider.getContractState(id);
      setAntState(state);
      if (state.records['@'].transactionId) {
        setTargetId(antState.records['@'].transactionId);
      }
      // todo: remove below for v1, this is a legacy format for ant record antStates.
      if (typeof state.records['@'] === 'string') {
        setTargetId(state.records['@']);
      }
    } catch (error: any) {
      console.error('Failed to fetch ANT Contract State.');
      setErrors({
        ...errors,
        ant: error,
      });
    }
  }

  async function loadAntConfirmations(id: ArweaveTransactionID) {
    setErrors({
      ...errors,
      confirmations: undefined,
    });
    try {
      const confirmations = await arweaveDataProvider.getTransactionStatus(id);
      setConfirmations(confirmations);
    } catch (error: any) {
      console.error('Failed to fetch confirmations.');
      setErrors({
        ...errors,
        confirmations: error,
      });
    }
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
              antState.name
            ) : errors.ant ? (
              <button
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  loadAntState(antId);
                }}
              >
                <RefreshAlertIcon
                  style={{
                    width: '24px',
                    height: '24px',
                    fill: 'var(-error-red)',
                  }}
                />
              </button>
            ) : (
              <Loader size={30} />
            )}
          </td>
          <td
            className="assets-table-item center"
            style={textColor ? { color: textColor } : {}}
          >
            <CopyTextButton
              displayText={`${antId
                .toString()
                .slice(0, isMobile ? 2 : 6)}...${antId
                .toString()
                .slice(isMobile ? -2 : -6)}`}
              copyText={antId.toString()}
              size={24}
              wrapperStyle={{
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
                    justifyContent: 'flex-start',
                    textColor,
                  }}
                />
              ) : errors.ant ? (
                <button
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    loadAntState(antId);
                  }}
                >
                  <RefreshAlertIcon
                    style={{
                      width: '24px',
                      height: '24px',
                      fill: 'var(-error-red)',
                    }}
                  />
                </button>
              ) : (
                <Loader size={30} />
              )}
            </td>
          )}
          <td
            className="assets-table-item center"
            style={textColor ? { color: textColor } : {}}
          >
            {confirmations ? (
              <TransactionStatus confirmations={confirmations} />
            ) : errors.confirmations ? (
              <button
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  loadAntConfirmations(antId);
                }}
              >
                <RefreshAlertIcon
                  style={{
                    width: '24px',
                    height: '24px',
                    fill: 'var(-error-red)',
                  }}
                />
              </button>
            ) : (
              <Loader size={24} />
            )}
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
      {showManageModal && confirmations ? (
        <ManageAntModal
          setShowModal={setShowModal}
          antDetails={{
            id: antId.toString(),
            name: antState.name,
            target: targetId ?? 'N/A',
            status: +confirmations,
            key: 0,
            state: antState as ArNSContractState,
          }}
          contractId={antId}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default AntRow;
