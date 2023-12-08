import { ArConnectWalletConnector } from '@src/services/wallets';
import { ArweaveAppWalletConnector } from '@src/services/wallets/ArweaveAppWalletConnector';
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
      const arweaveGate = await walletConnector.getGatewayConfig();
      if (arweaveGate?.host) {
        await dispatchNewGateway(
          arweaveGate.host,
          walletConnector,
          dispatchGlobalState,
        );
      }

      const address = await walletConnector.getWalletAddress();

      dispatchWalletState({
        type: 'setWalletAddress',
        payload: address,
      });
      dispatchWalletState({
        type: 'setWallet',
        payload: walletConnector,
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
            connect(new ArConnectWalletConnector());
          }}
        >
          <ArConnectIcon
            className="external-icon"
            width={'47px'}
            height={'47px'}
          />
          Connect via ArConnect
        </button>
        <button
          className="wallet-connect-button h2"
          onClick={() => {
            connect(new ArweaveAppWalletConnector());
          }}
        >
          <img className="external-icon" src={ArweaveAppIcon} alt="" />
          Connect using Arweave.app
        </button>{' '}
        <span
          className="flex flex-row white flex-center"
          style={{ whiteSpace: 'nowrap', gap: '5px', paddingTop: '16px' }}
        >
          Don&apos;t have a wallet?&nbsp;
          <a
            target="_blank"
            href="https://ar.io/wallet"
            style={{
              color: 'inherit',
              textDecoration: 'underline',
            }}
            rel="noreferrer"
            className="bold"
          >
            Get one here.
          </a>
        </span>
      </div>
    </div>
  );
}
export default ConnectWalletModal;
