import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import { useWalletAddress } from '../../../hooks';
import { ArConnectWalletConnector } from '../../../services/wallets';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveWalletConnector } from '../../../types';
import { ArConnectIcon, ArweaveAppIcon, CloseIcon } from '../../icons';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef(null);
  const [{}, dispatchGlobalState] = useGlobalState(); // eslint-disable-line
  const { wallet, walletAddress } = useWalletAddress();
  const navigate = useNavigate();

  useEffect(() => {
    // disable scrolling when modal is in view
    if (wallet && walletAddress) {
      closeModal();
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'scroll';
    };
  }, [wallet, walletAddress]);

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      closeModal();
    }
    return;
  }

  function closeModal() {
    // TODO; add a location.state.from to redirect back to a preferred location
    navigate(-1);
  }

  async function setGlobalWallet(walletConnector: ArweaveWalletConnector) {
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

  return (
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
            setGlobalWallet(new ArConnectWalletConnector());
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
  );
}
export default ConnectWalletModal;
