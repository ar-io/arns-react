import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  BeaconWalletConnector,
  EthWalletConnector,
  WanderWalletConnector,
} from '@src/services/wallets';
import { ArweaveAppWalletConnector } from '@src/services/wallets/ArweaveAppWalletConnector';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useConfig, useDisconnect } from 'wagmi';

import { useWalletState } from '../../../state/contexts/WalletState';
import { AoAddress, ArNSWalletConnector, WALLET_TYPES } from '../../../types';
import eventEmitter from '../../../utils/events';
import {
  ArweaveAppIcon,
  BeaconIcon,
  CloseIcon,
  MetamaskIcon,
  WanderIcon,
} from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const [
    { wallet, walletAddress, walletStateInitialized },
    dispatchWalletState,
  ] = useWalletState();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(!walletStateInitialized);

  const config = useConfig();
  const ethAccount = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnectAsync } = useDisconnect();

  // Handle Ethereum wallet connection - detect when wagmi becomes connected
  useEffect(() => {
    if (
      ethAccount.isConnected &&
      ethAccount.address &&
      ethAccount.connector &&
      !wallet
    ) {
      try {
        localStorage.setItem('walletType', WALLET_TYPES.ETHEREUM);

        const walletConnector = new EthWalletConnector(
          config,
          ethAccount.connector,
        );

        dispatchWalletState({
          type: 'setWalletAddress',
          payload: ethAccount.address,
        });
        dispatchWalletState({
          type: 'setWallet',
          payload: walletConnector,
        });
      } catch (error) {
        console.error('Failed to create Ethereum wallet connector:', error);
        localStorage.removeItem('walletType');
        eventEmitter.emit('error', error);
      }
    }
  }, [
    ethAccount.isConnected,
    ethAccount.address,
    ethAccount.connector,
    wallet,
    config,
    dispatchWalletState,
  ]);

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
    address?: AoAddress;
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

  async function connect(walletConnector: ArNSWalletConnector) {
    try {
      setConnecting(true);

      // Disconnect existing wallet before connecting new one
      if (wallet) {
        try {
          await wallet.disconnect();
        } catch {
          // Ignore disconnect errors - wallet may already be disconnected
        }
      }

      // Disconnect wagmi if switching to a non-Ethereum wallet
      if (ethAccount.isConnected) {
        try {
          await disconnectAsync();
        } catch {
          // Ignore disconnect errors
        }
      }

      await walletConnector.connect();

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
        <p className="section-header mb-4 font-bold">
          Connect with an Arweave wallet
        </p>
        <button
          // className="modal-close-button"
          className="absolute top-5 right-[1.875rem]"
          onClick={() => closeModal({ next: false })}
        >
          <CloseIcon className="fill-white size-6" />
        </button>
        <button
          disabled={connecting}
          className="wallet-connect-button text-base"
          onClick={() => {
            connect(new WanderWalletConnector());
          }}
        >
          <WanderIcon className="external-icon size-12 p-3" />
          Wander
        </button>

        <button
          className="wallet-connect-button text-base"
          onClick={() => {
            connect(new ArweaveAppWalletConnector());
          }}
        >
          <img
            className="external-icon size-12 p-3"
            src={ArweaveAppIcon}
            alt=""
          />
          Arweave.app
        </button>

        <button
          className="wallet-connect-button text-base"
          onClick={() => {
            connect(new BeaconWalletConnector());
          }}
        >
          <BeaconIcon className="external-icon size-12 p-3" />
          Beacon
        </button>

        <p className="section-header mb-4">Connect with an Ethereum wallet</p>
        <button
          type="button"
          className="wallet-connect-button text-base"
          disabled={connecting}
          onClick={async () => {
            // If already connected via wagmi and user wants to use same wallet
            // they can click again after Rainbow Kit shows "Already connected"
            // For wallet switching, we disconnect first then open modal
            if (ethAccount.isConnected) {
              try {
                // Disconnect existing wagmi connection to allow fresh wallet selection
                await disconnectAsync();
              } catch {
                // Ignore disconnect errors
              }
            }

            // Disconnect any existing non-Ethereum wallet
            if (wallet && !(wallet instanceof EthWalletConnector)) {
              try {
                await wallet.disconnect();
                dispatchWalletState({
                  type: 'setWalletAddress',
                  payload: undefined,
                });
                dispatchWalletState({
                  type: 'setWallet',
                  payload: undefined,
                });
              } catch {
                // Ignore disconnect errors
              }
            }

            // Open Rainbow Kit modal for wallet selection
            if (openConnectModal) {
              openConnectModal();
            }
          }}
        >
          <MetamaskIcon className="external-icon size-12 p-3" />
          Ethereum Wallets
        </button>

        <span
          className="flex flex-row white flex-center text-sm"
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
          >
            Get one here.
          </a>
        </span>
      </div>
    </div>
  );
}
export default ConnectWalletModal;
