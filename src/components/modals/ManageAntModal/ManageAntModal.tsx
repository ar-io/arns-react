import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { defaultDataProvider } from '../../../services/arweave';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ANTContractState, ArweaveTransactionId } from '../../../types';
import { getAntConfirmations } from '../../../utils/searchUtils';
import {
  AlertCircle,
  AlertTriangleIcon,
  CircleCheck,
  NotebookIcon,
  PencilIcon,
} from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import RowItem from '../../layout/tables/RowItem/RowItem';

function ManageAntModal({
  contractId,
  setShowModal,
}: {
  contractId: ArweaveTransactionId;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [{ arnsSourceContract }] = useGlobalState();
  const modalRef = useRef(null);
  const [contractState, setContractState] = useState<ANTContractState>();
  const [deploymentStatus, setDeploymentStatus] = useState({
    confirmations: 0,
    icon: <></>,
  });
  const [associatedNames, setAssociatedNames] = useState<Array<string>>([]);
  // todo: manage asset modal writes asset modifications to contract. It will auto detect if the asset is an ANT, name, or undername.
  // if the asset is a name, it will write modifications to the registry. If its an undername, it will write mods to the ant. If its an ant, it will write mods to the ant.

  useEffect(() => {
    loadDetails();
    const names = getAssociatedNames();
    setAssociatedNames(names);
  }, [contractId]);

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      setShowModal(false);
    }
    return;
  }

  function getAssociatedNames() {
    const domains: string[] = [];
    Object.entries(arnsSourceContract.records).map(([name, id]) => {
      if (id === contractId) {
        domains.push(name);
      }
    });
    return domains;
  }

  async function loadDetails() {
    const dataProvider = defaultDataProvider(contractId);
    const state = await dataProvider.getContractState(contractId);
    if (!state) {
      setShowModal(false);
    }
    setContractState(state);
    const confirmations = await getAntConfirmations(contractId);
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
    setDeploymentStatus({ confirmations: confirmations, icon: icon() });
  }
  return (
    <div
      className="modal-container"
      style={{ background: '#1E1E1E' }}
      ref={modalRef}
      onClick={handleClickOutside}
    >
      <div className="flex-column" style={{ margin: '10%' }}>
        <div className="flex-row">
          <span
            className="section-header flex-start"
            style={{ justifyContent: 'flex-start', width: '100%' }}
          >
            <NotebookIcon width={25} height={25} fill={'var(--text-white)'} />
            &nbsp;Manage ANT:&nbsp;
            <CopyTextButton
              copyText={contractId}
              displayText={contractId}
              size={24}
            />
          </span>
        </div>
        <table className="assets-table">
          <RowItem
            col1="Status:"
            col2={
              <span className="flex-row center">
                {deploymentStatus.icon}&nbsp;{deploymentStatus.confirmations}
                &nbsp;/&nbsp;50
              </span>
            }
            col3=""
            col4={<></>}
            col5={<></>}
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Associated Names:"
            col2={associatedNames ? associatedNames[0] : 'N/A'}
            col3=""
            col4={<></>}
            col5={<></>}
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Nickname:"
            col2={contractState?.name ? contractState.name : 'N/A'}
            col3=""
            col4={<></>}
            col5={
              <button className="button">
                <PencilIcon width={20} height={20} fill="var(--text-white)" />
              </button>
            }
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Ticker:"
            col2={contractState?.ticker ? contractState.ticker : 'N/A'}
            col3=""
            col4={<></>}
            col5={
              <button className="button">
                <PencilIcon width={20} height={20} fill="var(--text-white)" />
              </button>
            }
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Target ID:"
            col2={
              contractState?.records['@'].transactionId
                ? contractState.records['@'].transactionId
                : 'N/A'
            }
            col3=""
            col4={<></>}
            col5={
              <button className="button">
                <PencilIcon width={20} height={20} fill="var(--text-white)" />
              </button>
            }
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="ttlSeconds:"
            col2={
              contractState?.records['@'].ttlSeconds
                ? contractState.records['@'].ttlSeconds
                : 'N/A'
            }
            col3=""
            col4={<></>}
            col5={
              <button className="button">
                <PencilIcon width={20} height={20} fill="var(--text-white)" />
              </button>
            }
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Controller:"
            col2={contractState?.controller ? contractState.controller : 'N/A'}
            col3=""
            col4={<></>}
            col5={
              <button className="button">
                <PencilIcon width={20} height={20} fill="var(--text-white)" />
              </button>
            }
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Undernames:"
            col2={
              contractState?.records
                ? `${Object.keys(contractState.records).length} / 100`
                : 'N/A'
            }
            col3=""
            col4={<></>}
            col5={
              <button className="button">
                <PencilIcon width={20} height={20} fill="var(--text-white)" />
              </button>
            }
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
          <RowItem
            col1="Owner:"
            col2={contractState?.owner ? contractState.owner : 'N/A'}
            col3=""
            col4={<></>}
            col5={<button className="assets-manage-button">Transfer</button>}
            bgColor={'#1E1E1E'}
            textColor={'var(--text-white)'}
          />
        </table>
      </div>
    </div>
  );
}

export default ManageAntModal;
