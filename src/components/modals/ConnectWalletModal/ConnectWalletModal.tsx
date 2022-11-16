import { useEffect, useRef } from 'react';

import { ConnectWalletModalProps } from '../../../types';
import {
  ArConnectIcon,
  ArweaveAppIcon,
  CloseIcon,
  UploadJsonKey,
} from '../../icons';
import './styles.css';

function ConnectWalletModal(props: ConnectWalletModalProps): JSX.Element {
  const { setShowModal } = props;
  const modalRef = useRef(null);

  useEffect(() => {
    if (!modalRef || !modalRef.current) {
      return;
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef]);

  function handleClickOutside(event: MouseEvent) {
    if (modalRef.current && modalRef.current === event.target) {
      setShowModal(false);
    }
  }

  return (
    <div className="modalContainer" ref={modalRef}>
      <div className="connectWalletModal">
        <p
          className="sectionHeader"
          style={{ marginBottom: '1em', fontFamily: 'Rubik-Bold' }}
        >
          Connect with an Arweave wallet
        </p>
        <button
          className="modalCloseButton"
          onClick={() => {
            setShowModal(false);
          }}
        >
          <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
        </button>
        <button className="walletConnectButton">
          <img src={UploadJsonKey} alt="" width="47px" height="47px" />
          Import your JSON keyfile
        </button>
        <button className="walletConnectButton">
          <img src={ArConnectIcon} alt="" width="47px" height="47px" />
          Connect via ArConnect
        </button>
        <button className="walletConnectButton">
          <img src={ArweaveAppIcon} alt="" width="47px" height="47px" />
          Connect using Arweave.app
        </button>
        <span className="bold text white" style={{ marginTop: '1em' }}>
          Don&apos;t have a wallet?&nbsp;
          <a
            target="_blank"
            href="https://ardrive.io/start"
            style={{ color: 'inherit' }}
            rel="noreferrer"
          >
            &nbsp;Get one here
          </a>
        </span>
      </div>
    </div>
  );
}
export default ConnectWalletModal;
