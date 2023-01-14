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
  // todo: fix bug with isMobile: initial value not updating on screen resize
  const isMobile = useIsMobile();
  const [antState, setAntState] = useState<any>();
  const [antDetails, setAntDetails] = useState<{ [x: number]: any }>();
  const dataProvider = defaultDataProvider(arweave);

  // todo: implement error antState for row items
  useEffect(() => {
    loadAntState();
  }, [antId]);

  useEffect(() => {
    if (antState) {
      loadAntDetails();
    }
  }, [antState, isMobile]);

  async function loadAntState() {
    const state = await dataProvider.getContractState(antId);
    setAntState(state);
    return;
  }

  async function loadAntDetails() {
    // todo: get status from arweave transaction manager instead of manual query here
    // todo: get txID's from connected user balance and/or favorited assets
    const confirmations = await dataProvider.getContractConfirmations(antId);
    const icon = () => {
      if (confirmations > 0 && confirmations < 50) {
        return (
          <AlertTriangleIcon width={20} height={20} fill={'var(--accent)'} />
        );
      }
      if (confirmations > 49) {
        return (
          <CircleCheck width={20} height={20} fill={'var(--success-green)'} />
        );
      }
      return <AlertCircle width={20} height={20} fill={'var(--text-faded)'} />;
    };

    const name = () => {
      if (antState.name.length > 20) {
        return `${antState.name.slice(0, 10)}...${antState.name.slice(-10)}`;
      }
      return antState.name;
    };
    let transactionId = '';
    if (antState.records['@'].transactionId) {
      transactionId = antState.records['@'].transaction;
    }
    // todo: remove below for v1, this is a legacy format for ant record antStates.
    if (typeof antState.records['@'] === 'string') {
      transactionId = antState.records['@'];
    }
    setAntDetails({
      1: name(),
      2: isMobile ? (
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
      ),
      3: transactionId ? (
        isMobile ? (
          <CopyTextButton
            displayText={`${transactionId.slice(0, 2)}...${transactionId.slice(
              -2,
            )}`}
            copyText={transactionId}
            size={24}
          />
        ) : (
          <CopyTextButton
            displayText={`${transactionId.slice(0, 6)}...${transactionId.slice(
              -6,
            )}`}
            copyText={transactionId}
            size={24}
          />
        )
      ) : (
        'N/A'
      ),
      4: (
        <span className="text white bold center">
          {icon()}&nbsp;{!isMobile ? `${confirmations} / 50` : <></>}
        </span>
      ),
      5: <ManageAssetButtons asset={antId} assetType={'ant'} />,
    });

    return;
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
        {antDetails ? (
          Object?.values(antDetails).map((value: any, index) => (
            <td
              className="assets-table-item"
              style={textColor ? { color: textColor } : {}}
              key={index}
            >
              {value}
            </td>
          ))
        ) : (
          <>
            <td
              className="assets-table-item"
              style={textColor ? { color: textColor } : {}}
            >
              <Loader size={30} />
            </td>
            <td
              className="assets-table-item"
              style={textColor ? { color: textColor } : {}}
            >
              <Loader size={30} />
            </td>
            <td
              className="assets-table-item"
              style={textColor ? { color: textColor } : {}}
            >
              <Loader size={30} />
            </td>
            <td
              className="assets-table-item"
              style={textColor ? { color: textColor } : {}}
            >
              <Loader size={30} />
            </td>
            <td
              className="assets-table-item"
              style={textColor ? { color: textColor } : {}}
            >
              <Loader size={30} />
            </td>
          </>
        )}
      </tr>
    </>
  );
}

export default AntRow;
