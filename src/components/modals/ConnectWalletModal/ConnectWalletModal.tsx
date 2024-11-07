import { AOProcess, IO } from '@ar.io/sdk';
import {
  ArConnectWalletConnector,
  EthWalletConnector,
} from '@src/services/wallets';
import { ArweaveAppWalletConnector } from '@src/services/wallets/ArweaveAppWalletConnector';
import { METAMASK_URL } from '@src/utils/constants';
import { MetamaskError } from '@src/utils/errors';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAccount,
  useConnectors,
  useDisconnect,
  useSignMessage,
} from 'wagmi';

import { dispatchNewGateway } from '../../../state/actions';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import { AoAddress, ArNSWalletConnector } from '../../../types';
import eventEmitter from '../../../utils/events';
import {
  ArConnectIcon,
  ArweaveAppIcon,
  CloseIcon,
  MetamaskIcon,
} from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function ConnectWalletModal(): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const [{ ioProcessId, aoClient }, dispatchGlobalState] = useGlobalState();
  const [
    { wallet, walletAddress, walletStateInitialized },
    dispatchWalletState,
  ] = useWalletState();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(!walletStateInitialized);

  const ethAccount = useAccount();
  const { disconnectAsync: ethDisconnect } = useDisconnect();
  const signMessage = useSignMessage();
  const connectors = useConnectors();

  const viemConnector = connectors.find((conn) => conn.name === 'MetaMask');

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
      const contract = IO.init({
        process: new AOProcess({
          processId: ioProcessId,
          ao: aoClient,
        }),
        signer: walletConnector.contractSigner!,
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

  useEffect(() => {
    const handleEthAccount = async () => {
      if (!ethAccount?.address) {
        return;
      }
      if (!viemConnector) {
        throw new Error('Unable to find Viem connector for Metamask');
      }

      try {
        const connector = new EthWalletConnector(
          ethAccount,
          ethAccount.address,
          ethDisconnect,
          signMessage,
          viemConnector,
        );

        const arweaveGate = await connector.getGatewayConfig();
        const contract = IO.init({
          process: new AOProcess({
            processId: ioProcessId,
            ao: aoClient,
          }),
          signer: connector.contractSigner!,
        });
        if (arweaveGate?.host) {
          await dispatchNewGateway(
            arweaveGate.host,
            contract,
            dispatchGlobalState,
          );
        }

        const address = await connector.getWalletAddress();
        dispatchWalletState({
          type: 'setWalletAddress',
          payload: address,
        });
        dispatchWalletState({
          type: 'setWallet',
          payload: connector,
        });

        closeModal({ next: true, address });
      } catch (error: any) {
        eventEmitter.emit('error', error);
      }
    };

    handleEthAccount();
  }, [ethAccount]);

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
          <ArConnectIcon className="external-icon size-12" />
          ArConnect
        </button>

        <button
          className="wallet-connect-button h2"
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

        <p
          className="section-header"
          style={{ marginBottom: '1em', fontFamily: 'Rubik-Bold' }}
        >
          Connect with an Ethereum wallet
        </p>
        <button
          type="button"
          className="wallet-connect-button h2"
          onClick={async () => {
            if (!viemConnector) {
              throw new Error('Unable to find Viem connector for Metamask');
            }

            if (!window.ethereum?.isMetaMask) {
              window.open(METAMASK_URL, '_blank', 'noopener,noreferrer');
              return;
            }

            try {
              setConnecting(true);
              await viemConnector.connect();
            } catch {
              throw new MetamaskError('Metamask not connected');
            } finally {
              setConnecting(false);
            }
          }}
        >
          <MetamaskIcon className="external-icon size-12 p-3" />
          {window.ethereum?.isMetaMask ? 'Metamask' : 'Install Metamask'}
        </button>

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
