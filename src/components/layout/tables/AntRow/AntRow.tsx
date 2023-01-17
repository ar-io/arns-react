import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { defaultDataProvider } from '../../../../services/arweave';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ArweaveTransactionId } from '../../../../types';
import { AlertCircle, AlertTriangleIcon, CircleCheck } from '../../../icons';
import CopyTextButton from '../../../inputs/buttons/CopyTextButton/CopyTextButton';
import ManageAssetButtons from '../../../inputs/buttons/ManageAssetButtons/ManageAssetButtons';
import Loader from '../../Loader/Loader';

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
  const [nickname, setNickname] = useState<string>();
  const [statusIcon, setStatusIcon] = useState<JSX.Element>();
  const [confirmations, setConfirmations] = useState<number>(0);
  const [targetId, setTargetId] = useState<string>();

  const dataProvider = defaultDataProvider(arweave);

  // todo: implement error antState for row items
  useEffect(() => {
    getStatus();
    loadAntState();
  }, [antId]);

  useEffect(() => {
    if (antState) {
      getName();
      getTargetId();
    }
  }, [antState]);

  async function loadAntState() {
    const state = await dataProvider.getContractState(antId);
    setAntState(state);
    return;
  }

  async function getStatus() {
    const confirmations = await dataProvider.getContractConfirmations(antId);
    setConfirmations(confirmations);

    if (confirmations > 0 && confirmations < 50) {
      setStatusIcon(
        <AlertTriangleIcon width={20} height={20} fill={'var(--accent)'} />,
      );
    }
    if (confirmations > 49) {
      setStatusIcon(
        <CircleCheck width={20} height={20} fill={'var(--success-green)'} />,
      );
    }
    if (confirmations <= 0) {
      setStatusIcon(
        <AlertCircle width={20} height={20} fill={'var(--text-faded)'} />,
      );
    }
  }

  function getName() {
    if (!antState) {
      return;
    }
    if (antState.name.length > 20) {
      setNickname(
        `${antState.name.slice(0, 10)}...${antState.name.slice(-10)}`,
      );
    }
    if (antState.name.length < 20) {
      setNickname(antState.name);
    }
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
            {nickname ? nickname : <Loader size={30} />}
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
            {typeof targetId == 'string' ? (
              isMobile ? (
                <CopyTextButton
                  displayText={`${targetId.slice(0, 2)}...${targetId.slice(
                    -2,
                  )}`}
                  copyText={antId}
                  size={24}
                />
              ) : (
                <CopyTextButton
                  displayText={`${targetId.slice(0, 6)}...${targetId.slice(
                    -6,
                  )}`}
                  copyText={antId}
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
            {statusIcon ? (
              <span className="text white bold center">
                {statusIcon}&nbsp;{!isMobile ? `${confirmations} / 50` : <></>}
              </span>
            ) : (
              <Loader size={30} />
            )}
          </td>
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
          >
            <ManageAssetButtons asset={antId} assetType={'ant'} />
          </td>
        </>
      </tr>
    </>
  );
}

export default AntRow;
