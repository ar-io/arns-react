import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { SolanaWalletConnector } from '@src/services/wallets';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useWalletState } from '../../../state/contexts/WalletState';
import { AoAddress, WALLET_TYPES } from '../../../types';
import eventEmitter from '../../../utils/events';
import { CloseIcon } from '../../icons';
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

  const solanaWallet = useWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();

  // Detect when the @solana/wallet-adapter-react picker has finished
  // connecting a Solana wallet — wrap the adapter into our connector and
  // hand it off to the global wallet state.
  //
  // Notes on the gating:
  // - We require `publicKey` (signals the user picked a wallet AND approved
  //   the connect prompt) but tolerate `signTransaction` being undefined at
  //   first render: some adapters (Phantom included) attach signing methods a
  //   tick after `connected` flips, and waiting for `signTransaction` here
  //   would race the picker closing. The `SolanaWalletConnector` re-binds
  //   the signer lazily once it's available.
  useEffect(() => {
    console.debug('[solana-connect] state', {
      connected: solanaWallet.connected,
      connecting: solanaWallet.connecting,
      hasPublicKey: !!solanaWallet.publicKey,
      hasSignTx: !!solanaWallet.signTransaction,
      currentWalletType: wallet?.tokenType,
    });
    if (
      solanaWallet.connected &&
      solanaWallet.publicKey &&
      (!wallet || wallet.tokenType !== 'solana')
    ) {
      try {
        const connector = new SolanaWalletConnector({
          publicKey: solanaWallet.publicKey,
          connected: solanaWallet.connected,
          connecting: solanaWallet.connecting,
          disconnect: solanaWallet.disconnect,
          signTransaction: solanaWallet.signTransaction as never,
        });
        localStorage.setItem('walletType', WALLET_TYPES.SOLANA);
        console.info(
          '[solana-connect] wiring SolanaWalletConnector for',
          solanaWallet.publicKey.toBase58(),
        );
        dispatchWalletState({
          type: 'setWalletAndAddress',
          payload: {
            wallet: connector,
            walletAddress: solanaWallet.publicKey.toBase58() as never,
          },
        });
      } catch (error) {
        console.error('[solana-connect] failed to wire connector', error);
        eventEmitter.emit('error', error);
      }
    }
  }, [
    solanaWallet.connected,
    solanaWallet.publicKey,
    solanaWallet.signTransaction,
    wallet,
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
        <p className="section-header mb-4 font-bold">
          Connect with a Solana wallet
        </p>
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
              // a wallet and approves connection, the useEffect above wraps
              // it in our SolanaWalletConnector and pushes it into state.
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

        <span
          className="flex flex-row white flex-center text-sm"
          style={{ whiteSpace: 'nowrap', gap: '5px', paddingTop: '16px' }}
        >
          Don&apos;t have a wallet?&nbsp;
          <a
            target="_blank"
            href="https://solana.com/solana-wallets"
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
