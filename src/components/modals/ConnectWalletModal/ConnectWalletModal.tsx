import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useWalletAddress } from '../../../hooks';
import { ArConnectWalletConnector } from '../../../services/wallets';
import { ARCONNECT_WALLET_PERMISSIONS } from '../../../services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveWalletConnector } from '../../../types';
import eventEmitter from '../../../utils/events';
import { ArConnectIcon, ArweaveAppIcon, CloseIcon } from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef(null);
  const [, dispatchGlobalState] = useGlobalState();
  const { wallet, walletAddress } = useWalletAddress();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const walletLoaded = !!window.arweaveWallet;

  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const handleArweaveWalletLoaded = async () => {
      // Check for permissions
      const permissions = await window.arweaveWallet.getPermissions(); // Replace with actual API call
      const hasRequiredPermissions = ARCONNECT_WALLET_PERMISSIONS.every(
        (perm) => permissions.includes(perm),
      );

      setHasPermissions(hasRequiredPermissions);
      if (hasRequiredPermissions && walletAddress) {
        closeModal({ next: true });
      }
      setLoading(false);
    };

    if (walletLoaded) {
      handleArweaveWalletLoaded();
    } else {
      window.addEventListener('arweaveWalletLoaded', handleArweaveWalletLoaded);
    }

    return () => {
      window.removeEventListener(
        'arweaveWalletLoaded',
        handleArweaveWalletLoaded,
      );
    };
  }, []);

  useEffect(() => {
    // disable scrolling when modal is in view
    if (wallet && walletAddress) {
      closeModal({ next: true });
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'scroll';
    };
  }, [wallet, walletAddress]);

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      closeModal({ next: false });
    }
    return;
  }

  async function closeModal({ next }: { next: boolean }) {
    if (!walletAddress) {
      navigate(state?.from ?? '/', { state: { from: state?.from ?? '/' } });
      return;
    }

    if (next) {
      navigate(state?.to ?? '/');
    } else {
      navigate(state?.from ?? '/');
    }
  }

  async function setGlobalWallet(walletConnector: ArweaveWalletConnector) {
    try {
      setConnecting(true);
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
      closeModal({ next: true });
    } catch (error: any) {
      eventEmitter.emit('error', error);
    } finally {
      setConnecting(false);
    }
  }

  if (loading || (hasPermissions && walletLoaded) || !walletLoaded) {
    return <PageLoader loading={true} message={'Connecting to Wallet'} />; // Replace with your loading component
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
        <button
          className="modal-close-button"
          onClick={() => closeModal({ next: false })}
        >
          <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
        </button>

        <button
          disabled={connecting}
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
