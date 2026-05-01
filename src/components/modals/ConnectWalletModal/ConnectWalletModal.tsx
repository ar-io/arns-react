import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useWalletState } from '../../../state/contexts/WalletState';
import { AoAddress } from '../../../types';
import { CloseIcon } from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const [{ wallet, walletAddress, walletStateInitialized }] = useWalletState();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(!walletStateInitialized);

  const { setVisible: setSolanaModalVisible } = useWalletModal();

  // The bridging of `@solana/wallet-adapter-react` → `SolanaWalletConnector`
  // now lives in `WalletStateProvider` so reconnection happens on every
  // mount regardless of route. This component only opens the picker; once
  // the user approves, the global effect notices `useWallet().connected`
  // flip and pushes the connector + address into wallet state, which
  // triggers our `useEffect([wallet, walletAddress])` below to navigate
  // away from `/connect`.

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
