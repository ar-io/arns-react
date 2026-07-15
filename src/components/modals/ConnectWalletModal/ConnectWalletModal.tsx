import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
  EthWalletConnector,
  WanderWalletConnector,
} from '@src/services/wallets';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';

import { useWalletState } from '../../../state/contexts/WalletState';
import { AoAddress, ArNSWalletConnector } from '../../../types';
import eventEmitter from '../../../utils/events';
import { CloseIcon, MetamaskIcon, WanderIcon } from '../../icons';
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

  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const ethAccount = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnectAsync } = useDisconnect();

  // The bridging of `@solana/wallet-adapter-react` → `SolanaWalletConnector`
  // and of the wagmi ETH session → `EthWalletConnector` now lives in
  // `WalletStateProvider`, so reconnection happens on every mount regardless of
  // route. This component only opens the pickers; once the user approves, the
  // global effects push the connector + address into wallet state, which
  // triggers the `useEffect([wallet, walletAddress])` below to navigate away
  // from `/connect`.

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

  /**
   * Connect an injected/native connector (Arweave/Wander). Solana + ETH are
   * handled by their own picker modals; their connectors are wired up by the
   * effects in `WalletStateProvider` once the picker completes.
   */
  async function connect(walletConnector: ArNSWalletConnector) {
    try {
      setConnecting(true);

      // Disconnect any existing wallet before connecting a new identity.
      if (wallet) {
        try {
          await wallet.disconnect();
        } catch {
          // Ignore — wallet may already be disconnected.
        }
      }
      if (ethAccount.isConnected) {
        try {
          await disconnectAsync();
        } catch {
          // Ignore disconnect errors.
        }
      }

      await walletConnector.connect();
      const address = await walletConnector.getWalletAddress();
      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: walletConnector,
          walletAddress: address,
        },
      });
      closeModal({ next: true, address });
    } catch (error: any) {
      eventEmitter.emit('error', error);
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return <PageLoader loading={true} message={'Connecting to Wallet'} />;
  }

  return (
    // eslint-disable-next-line
    <div
      className="modal-container"
      ref={modalRef}
      onClick={handleClickOutside}
    >
      <div className="connect-wallet-modal">
        <p className="section-header mb-4 font-bold">Connect a wallet</p>
        <button
          className="absolute top-5 right-[1.875rem]"
          onClick={() => closeModal({ next: false })}
        >
          <CloseIcon className="fill-white size-6" />
        </button>

        <button
          type="button"
          className="wallet-connect-button text-base"
          disabled={connecting}
          onClick={async () => {
            setConnecting(true);
            try {
              // Open the wallet-adapter-react-ui picker. Once the user picks
              // a wallet and approves, the global effect in WalletStateProvider
              // wraps it in our SolanaWalletConnector and pushes it into state.
              setSolanaModalVisible(true);
            } finally {
              setConnecting(false);
            }
          }}
        >
          <span className="external-icon flex size-12 items-center justify-center p-3 text-2xl font-bold">
            ◎
          </span>
          Solana Wallets
        </button>

        <button
          type="button"
          disabled={connecting}
          className="wallet-connect-button text-base"
          onClick={() => {
            connect(new WanderWalletConnector());
          }}
        >
          <WanderIcon className="external-icon size-12 p-3" />
          Wander (Arweave)
        </button>

        <button
          type="button"
          className="wallet-connect-button text-base"
          disabled={connecting}
          onClick={async () => {
            // Fresh ETH selection: drop any existing wagmi + non-ETH wallet,
            // then open the RainbowKit picker. WalletStateProvider's ETH effect
            // wires the connector once wagmi reports connected.
            if (ethAccount.isConnected) {
              try {
                await disconnectAsync();
              } catch {
                // Ignore disconnect errors.
              }
            }
            if (wallet && !(wallet instanceof EthWalletConnector)) {
              try {
                await wallet.disconnect();
                dispatchWalletState({
                  type: 'setWalletAndAddress',
                  payload: {
                    wallet: undefined,
                    walletAddress: undefined,
                  },
                });
              } catch {
                // Ignore disconnect errors.
              }
            }
            openConnectModal?.();
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
