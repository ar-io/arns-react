import { useEffect, useRef, useState } from 'react';

import { ArweaveTransactionID } from '../../../../types/ArweaveTransactionID';
import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ANTContractState } from '../../../types';
import { NotebookIcon, PencilIcon } from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import RowItem from '../../layout/tables/RowItem/RowItem';

function ManageAntModal({
  contractId,
  setShowModal,
  state,
  confirmations,
  targetId,
}: {
  contractId: ArweaveTransactionID;
  setShowModal: (show: boolean) => void;
  state: ANTContractState;
  confirmations: number;
  targetId?: string;
}) {
  const [{ arnsSourceContract }] = useGlobalState();
  const modalRef = useRef(null);
  const [associatedNames, setAssociatedNames] = useState<string[]>([]);
  const [antDetails, setAntDetails] = useState<any[]>();
  const isMobile = useIsMobile();
  // todo: manage asset modal writes asset modifications to contract. It will auto detect if the asset is an ANT, name, or undername.
  // if the asset is a name, it will write modifications to the registry. If its an undername, it will write mods to the ant. If its an ant, it will write mods to the ant.

  useEffect(() => {
    setAssociatedNames(getAssociatedNames());
    setDetails();
  }, [contractId, state, targetId, confirmations]);

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      setShowModal(false);
    }
    return;
  }

  function getAssociatedNames() {
    const domains: string[] = [];
    Object.entries(arnsSourceContract.records).map(([name, id]) => {
      if (id === contractId.toString()) {
        domains.push(name);
      }
    });
    return domains;
  }

  function setDetails() {
    setAntDetails([
      [
        <td className="assets-table-item">Status:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          <TransactionStatus
            key={`${contractId}-confirmations`}
            confirmations={confirmations}
          />
        </td>,
      ],
      [
        <td className="assets-table-item">
          {`Associated Names (${associatedNames.length}) :`}
        </td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {associatedNames
            ? associatedNames.map((name) => (
                <>
                  <span
                    className="assets-manage-button"
                    key={`${contractId}-name`}
                  >
                    {name}
                  </span>
                  &nbsp;
                </>
              ))
            : 'N/A'}
        </td>,
      ],
      [
        <td className="assets-table-item">Nickname:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {state?.name ? state.name : 'N/A'}
        </td>,
        <button className="button" key={`${contractId}-nickname-edit-button`}>
          <PencilIcon width={20} height={20} fill="var(--text-white)" />
        </button>,
      ],
      [
        <td className="assets-table-item">Ticker:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {state?.ticker ? state.ticker : 'N/A'}
        </td>,
        <button className="button" key={`${contractId}-ticker-edit-button`}>
          <PencilIcon width={20} height={20} fill="var(--text-white)" />
        </button>,
      ],
      [
        <td className="assets-table-item">Target ID:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {targetId ? targetId : 'N/A'}
        </td>,
        <button className="button" key={`${contractId}-targetId-edit-button`}>
          <PencilIcon width={20} height={20} fill="var(--text-white)" />
        </button>,
      ],
      [
        <td className="assets-table-item">ttlSeconds:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {state?.records['@'].ttlSeconds
            ? state.records['@'].ttlSeconds
            : 'N/A'}
        </td>,
        <button className="button" key={`${contractId}-ttl-edit-button`}>
          <PencilIcon width={20} height={20} fill="var(--text-white)" />
        </button>,
      ],
      [
        <td className="assets-table-item">Controller:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {state?.controllers ? state.controllers.toString() : 'N/A'}
        </td>,
        <button className="button" key={`${contractId}-controller-edit-button`}>
          <PencilIcon width={20} height={20} fill="var(--text-white)" />
        </button>,
      ],
      [
        <td className="assets-table-item">Undernames:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {state?.records
            ? `${Object.keys(state.records).length - 1} / 100`
            : 'N/A'}
        </td>,
        <button className="button" key={`${contractId}-records-button`}>
          <PencilIcon width={20} height={20} fill="var(--text-white)" />
        </button>,
      ],
      [
        <td className="assets-table-item">Owner:</td>,
        <td className="assets-table-item" style={{ flex: 4 }}>
          {state?.owner ? state.owner.toString() : 'N/A'}
        </td>,
        <button
          className="assets-manage-button"
          key={`${contractId}-transfer-button`}
        >
          Transfer
        </button>,
      ],
    ]);
  }

  return (
    // eslint-disable-next-line
    <div
      className="modal-container"
      style={{ background: '#1E1E1E' }}
      ref={modalRef}
      onClick={handleClickOutside}
    >
      <div className="flex-column" style={{ margin: '10%' }}>
        <div
          className="flex"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <span className="flex bold text-medium white">
            <NotebookIcon width={25} height={25} fill={'var(--text-white)'} />
            &nbsp;Manage ANT:&nbsp;
            <span className="flex">
              {isMobile ? (
                <CopyTextButton
                  displayText={`${contractId
                    .toString()
                    .slice(0, 10)}...${contractId.toString().slice(-10)}`}
                  copyText={contractId.toString()}
                  size={24}
                  wrapperStyle={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textColor: 'var(--bright-white)',
                  }}
                />
              ) : (
                <CopyTextButton
                  displayText={contractId.toString()}
                  copyText={contractId.toString()}
                  size={24}
                  wrapperStyle={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textColor: 'var(--bright-white)',
                  }}
                />
              )}
            </span>
          </span>
        </div>
        <table className="assets-table">
          {antDetails?.map((rowDetails) => (
            <RowItem
              details={rowDetails}
              bgColor={'#1E1E1E'}
              textColor={'var(--text-white)'}
            />
          ))}
        </table>
      </div>
    </div>
  );
}

export default ManageAntModal;
