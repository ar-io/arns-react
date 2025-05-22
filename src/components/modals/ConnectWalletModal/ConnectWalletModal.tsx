import { AOProcess, ARIO } from '@ar.io/sdk/web';
import {
  BeaconWalletConnector,
  EthWalletConnector,
  WanderWalletConnector,
} from '@src/services/wallets';
import { ArweaveAppWalletConnector } from '@src/services/wallets/ArweaveAppWalletConnector';
import { METAMASK_URL } from '@src/utils/constants';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConfig } from 'wagmi';

import { dispatchNewGateway } from '../../../state/actions';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import { AoAddress, ArNSWalletConnector } from '../../../types';
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
  const [{ arioProcessId, aoClient, turboNetwork }, dispatchGlobalState] =
    useGlobalState();
  const [
    { wallet, walletAddress, walletStateInitialized },
    dispatchWalletState,
  ] = useWalletState();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(!walletStateInitialized);

  const config = useConfig();

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
      await walletConnector.connect();
      const arweaveGate = await walletConnector.getGatewayConfig();
      const contract = ARIO.init({
        paymentUrl: turboNetwork.PAYMENT_URL,
        process: new AOProcess({
          processId: arioProcessId,
          ao: aoClient,
        }),
        signer: walletConnector.turboSigner!,
      });
      if (arweaveGate?.host) {
        await dispatchNewGateway(
          arweaveGate.host,
          contract,
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
          onClick={async () => {
            if (!config) {
              throw new Error(
                'Application is not not properly configured for Metamask.',
              );
            }

            if (!window.ethereum?.isMetaMask) {
              window.open(METAMASK_URL, '_blank', 'noopener,noreferrer');
              return;
            }

            connect(new EthWalletConnector(config));
          }}
        >
          <MetamaskIcon className="external-icon size-12 p-3" />
          {window?.ethereum?.isMetaMask ? 'Metamask' : 'Install Metamask'}
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
