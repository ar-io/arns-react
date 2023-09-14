import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useWalletAddress } from '../../../hooks';
import { ArConnectWalletConnector } from '../../../services/wallets';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveWalletConnector } from '../../../types';
import eventEmitter from '../../../utils/events';
import { ArConnectIcon, ArweaveAppIcon, CloseIcon } from '../../icons';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef(null);
  const [, dispatchGlobalState] = useGlobalState();
  const { wallet, walletAddress } = useWalletAddress();
  const navigate = useNavigate();
  const { state } = useLocation();

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

  // ISSUE: [PE-4603] bug, need to click twice to close modal
  async function closeModal() {
    if (!walletAddress) {
      console.log(walletAddress);
      navigate(state?.from ?? '/', { state: { from: state?.from ?? '/' } });
    }
    navigate(state?.to ? state.to : state?.from ? state.from : '/');
  }

  async function setGlobalWallet(walletConnector: ArweaveWalletConnector) {
    try {
      await walletConnector.connect();
      const arconnectGate = await walletConnector.getGatewayConfig();
      if (arconnectGate?.host) {
        dispatchGlobalState({
          type: 'setGateway',
          payload: arconnectGate.host,
        });
      }
      dispatchGlobalState({
        type: 'setWallet',
        payload: walletConnector,
      });
      await walletConnector.getWalletAddress().then((address) => {
        dispatchGlobalState({
          type: 'setWalletAddress',
          payload: address,
        });
      });
      closeModal();
    } catch (error: any) {
      eventEmitter.emit('error', error);
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
        <button className="modal-close-button" onClick={() => closeModal()}>
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
