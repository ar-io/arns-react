import { useState } from 'react';

import { JsonWalletConnector } from '../../../services/wallets/JsonWalletConnector';
import { useStateValue } from '../../../state/state';
import {
  ArweaveWalletConnector,
  ConnectWalletModalProps,
} from '../../../types';
import {
  ArConnectIcon,
  ArweaveAppIcon,
  CloseIcon,
  UploadJsonKey,
} from '../../icons';
import './styles.css';

function ConnectWalletModal({
  setShowModal,
}: ConnectWalletModalProps): JSX.Element {
  const [clickOut, setClickOut] = useState(false);
  const [{}, dispatch] = useStateValue(); // eslint-disable-line

  async function setGlobalWallet(walletConnector: ArweaveWalletConnector) {
    try {
      const wallet = await walletConnector.connect();
      // TODO: set wallet in local storage/securely cache
      dispatch({
        type: 'setJwk',
        payload: wallet,
      });
    } catch (error: any) {
      console.error(error);
      // TODO: push error to global state and display error
    }
  }

  return (
    <button
      className="modalContainer"
      onClick={() => clickOut && setShowModal(false)}
    >
      <div
        className="connectWalletModal"
        onMouseLeave={() => setClickOut(true)}
        onMouseEnter={() => setClickOut(false)}
      >
        <p
          className="sectionHeader"
          style={{ marginBottom: '1em', fontFamily: 'Rubik-Bold' }}
        >
          Connect with an Arweave wallet
        </p>
        <button
          className="modalCloseButton"
          onClick={() => {
            setShowModal(false);
          }}
        >
          <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
        </button>
        <div className="walletConnectButton">
          <img src={UploadJsonKey} alt="" width="47px" height="47px" />
          Import your JSON keyfile
          <label className="span-all">
            <input
              className="hidden"
              type="file"
              onChange={(e) =>
                e.target?.files?.length &&
                setGlobalWallet(new JsonWalletConnector(e.target.files[0]))
              }
            />
          </label>
        </div>
        <button className="walletConnectButton">
          <img src={ArConnectIcon} alt="" width="47px" height="47px" />
          Connect via ArConnect
        </button>
        <button className="walletConnectButton">
          <img src={ArweaveAppIcon} alt="" width="47px" height="47px" />
          Connect using Arweave.app
        </button>
        <span className="bold text white" style={{ marginTop: '1em' }}>
          Don&apos;t have a wallet?&nbsp;
          <a
            target="_blank"
            href="https://ardrive.io/start"
            style={{ color: 'inherit' }}
            rel="noreferrer"
          >
            &nbsp;Get one here
          </a>
        </span>
      </div>
    </button>
  );
}
export default ConnectWalletModal;
