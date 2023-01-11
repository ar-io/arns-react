import { useEffect, useRef } from 'react';

import { useWalletAddress } from '../../../hooks';
import { ArConnectWalletConnector } from '../../../services/wallets';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveGraphQLAPI, ArweaveWalletConnector } from '../../../types';
import { ArConnectIcon, ArweaveAppIcon, CloseIcon } from '../../icons';
import './styles.css';

function ConnectWalletModal({ show }: { show: boolean }): JSX.Element {
  const modalRef = useRef(null);
  const [{ arweave }, dispatchGlobalState] = useGlobalState();
  const { wallet, walletAddress } = useWalletAddress();
  useEffect(() => {
    // disable scrolling when modal is in view
    if (wallet && walletAddress) {
      dispatchGlobalState({
        type: 'setShowConnectWallet',
        payload: false,
      });
    }
    if (show) {
      document.body.style.overflow = 'hidden';
      return;
    }
    document.body.style.overflow = 'unset';
  }, [show, wallet, walletAddress]);

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      closeModal();
    }
    return;
  }

  function closeModal() {
    dispatchGlobalState({
      type: 'setShowConnectWallet',
      payload: false,
    });
  }

  async function setGlobalWallet(
    walletConnector: ArweaveWalletConnector & ArweaveGraphQLAPI,
  ) {
    try {
      await walletConnector.connect();
      dispatchGlobalState({
        type: 'setWallet',
        payload: walletConnector,
      });
    } catch (error: any) {
      console.error(error);
    }
  }

  return show ? (
    // eslint-disable-next-line
    <div
      className="modal-container"
      ref={modalRef}
      onClick={handleClickOutside}
    >
      <div className="connect-wallet-modal">
        <p
          className="section-header"
          style={{ marginBottom: '1em', fontFamily: 'Rubik-Bold' }}
        >
          Connect with an Arweave wallet
        </p>
        <button className="modal-close-button" onClick={closeModal}>
          <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
        </button>

        <button
          className="wallet-connect-button h2"
          onClick={() => {
            setGlobalWallet(new ArConnectWalletConnector(arweave));
          }}
        >
          <ArConnectIcon
            className="external-icon"
            width={'47px'}
            height={'47px'}
          />
          Connect via ArConnect
        </button>
        <button className="wallet-connect-button h2">
          <img className="external-icon" src={ArweaveAppIcon} alt="" />
          <a
            target="_blank"
            href="https://ardrive.io/start"
            style={{
              color: 'inherit',
              paddingLeft: '65px',
              textDecoration: 'none',
            }}
            rel="noreferrer"
            className="span-all flex-row left"
          >
            I need a wallet
          </a>
        </button>
      </div>
    </div>
  ) : (
    <></>
  );
}
export default ConnectWalletModal;
