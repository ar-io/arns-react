import { useEffect, useRef } from 'react';

import {
  ArConnectWalletConnector,
  JsonWalletConnector,
} from '../../../services/wallets';
import { useStateValue } from '../../../state/state';
import { ArweaveWalletConnector } from '../../../types';
import {
  ArConnectIcon,
  ArweaveAppIcon,
  CloseIcon,
  UploadIcon,
} from '../../icons';
import './styles.css';

function ConnectWalletModal({ show }: { show: boolean }): JSX.Element {
  const modalRef = useRef(null);
  const [{}, dispatch] = useStateValue(); // eslint-disable-line

  useEffect(() => {
    // disable scrolling when modal is in view
    if (show) {
      document.body.style.overflow = 'hidden';
      return;
    }
    document.body.style.overflow = 'unset';
  }, [show]);

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      closeModal();
    }
    return;
  }

  function closeModal() {
    dispatch({
      type: 'setConnectWallet',
      payload: false,
    });
  }

  async function setGlobalWallet(walletConnector: ArweaveWalletConnector) {
    try {
      await walletConnector.connect();
      dispatch({
        type: 'setWalletAddress',
        payload: await walletConnector.getWalletAddress(),
      });
    } catch (error: any) {
      console.error(error);
    }
  }

  return show ? (
    // eslint-disable-next-line
    <div className="modalContainer" ref={modalRef} onClick={handleClickOutside}>
      <div className="connectWalletModal">
        <p
          className="sectionHeader"
          style={{ marginBottom: '1em', fontFamily: 'Rubik-Bold' }}
        >
          Connect with an Arweave wallet
        </p>
        <button className="modalCloseButton" onClick={closeModal}>
          <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
        </button>
        <button className="walletConnectButton h2">
          <UploadIcon className="external-icon" fill={'var(--text-white)'} />
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
        </button>
        <button
          className="walletConnectButton h2"
          onClick={() => setGlobalWallet(new ArConnectWalletConnector())}
        >
          <ArConnectIcon className="external-icon" />
          Connect via ArConnect
        </button>
        <button className="walletConnectButton h2">
          <img className="external-icon" src={ArweaveAppIcon} alt="" />
          Connect using Arweave.app
        </button>
        <span className="bold text white h2" style={{ marginTop: '1em' }}>
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
  ) : (
    <></>
  );
}
export default ConnectWalletModal;
