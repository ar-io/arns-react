import { useEffect, useRef } from 'react';

import { JsonWalletConnector } from '../../../services/wallets/JsonWalletConnector';
import { useStateValue } from '../../../state/state';
import {
  ArweaveWalletConnector,
  ConnectWalletModalProps,
} from '../../../types';
import {
  ArConnectIcon,
  ArweaveAppIcon,
  CloseIcon,
  UploadJsonKey,
} from '../../icons';
import './styles.css';

function ConnectWalletModal({
  setShowModal,
}: ConnectWalletModalProps): JSX.Element {
  const modalRef = useRef(null);
  const [{}, dispatch] = useStateValue(); // eslint-disable-line
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

  async function setGlobalWallet(walletConnector: ArweaveWalletConnector) {
    try {
      const wallet = await walletConnector.connect();
      // TODO: set wallet in local storage/securely cache
      dispatch({
        type: 'setJwk',
        payload: wallet,
      });
    } catch (error: any) {
      console.error(error);
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
        <div className="walletConnectButton">
          <img src={UploadJsonKey} alt="" width="47px" height="47px" />
          Import your JSON keyfile
          <label className="span-all">
            <input
              className="hidden"
              type="file"
              onChange={(e) =>
                e.target?.files?.length &&
                setGlobalWallet(new JsonWalletConnector(e.target.files[0]))
              }
            />
          </label>
        </div>
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
