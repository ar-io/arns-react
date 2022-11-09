import { useState } from 'react';
import ConnectWalletModal from '../../../modals/ConnectWalletModal/ConnectWalletModal';
import './styles.css';

function ConnectButton(): JSX.Element {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="connectButton"
        onClick={() => setShowModal(!showModal)}
      >
        Connect
      </button>
      {showModal && <ConnectWalletModal setShowModal={setShowModal} />}
    </>
  );
}

export default ConnectButton;
