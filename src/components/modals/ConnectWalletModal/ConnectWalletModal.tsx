import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { dispatchNewGateway } from '../../../state/actions';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import { ArweaveWalletConnector } from '../../../types';
import eventEmitter from '../../../utils/events';
import { ArConnectIcon, ArweaveAppIcon, CloseIcon } from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const [, dispatchGlobalState] = useGlobalState();
  const [
    { wallet, walletAddress, walletStateInitialized },
    dispatchWalletState,
  ] = useWalletState();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(!walletStateInitialized);

  useEffect(() => {
    if (walletStateInitialized) {
      setLoading(false);
    }
  }, [walletStateInitialized]);

  useEffect(() => {
    // disable scrolling when modal is in view
    if (wallet && walletAddress) {
      closeModal({ next: true, address: walletAddress });
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

  async function closeModal({
    next,
    address,
  }: {
    next: boolean;
    address?: ArweaveTransactionID;
  }) {
    console.log({
      from: state?.from,
      to: state?.to,
      next,
      address,
    });
    if (!address) {
      navigate(state?.from ?? '/', { state: { from: state?.from ?? '/' } });
      return;
    }

    if (next) {
      navigate(state?.to ?? '/');
    } else {
      navigate(state?.from ?? '/');
    }
  }

  async function connect(walletConnector: ArweaveWalletConnector) {
    try {
      setConnecting(true);
      await walletConnector.connect();
      const arconnectGate = await walletConnector.getGatewayConfig();
      if (arconnectGate?.host) {
        await dispatchNewGateway(arconnectGate.host, dispatchGlobalState);
      }
      const address = await walletConnector.getWalletAddress();
      dispatchWalletState({
        type: 'setWalletAddress',
        payload: address,
      });

      closeModal({ next: true, address });
    } catch (error: any) {
      if (walletConnector) {
        eventEmitter.emit('error', error);
      }
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
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
            if (wallet) {
              connect(wallet);
            } else {
              window.open('https://arconnect.io');
            }
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
            href="https://ar.io/wallet"
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
