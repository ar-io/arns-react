import { JWKInterface } from 'arweave/node/lib/wallet';
import { useState } from 'react';

import { JsonWalletProvider } from '../../../services/arweave/wallets/JsonWalletProvider';
import { useStateValue } from '../../../state/state';
import { ConnectWalletModalProps } from '../../../types';
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

  const [{}, dispatch] = useStateValue();

  async function uploadJwk(e: any) {
    const provider = new JsonWalletProvider();
    const jwk = await provider.getWallet(e);

    console.log(jwk);

    try {
      if (!jwk) {
        throw Error('invalid key');
      }

      dispatch({
        type: 'setJwk',
        payload: jwk,
      });
    } catch (error) {
      console.error(error);
    }

    return setShowModal(false);
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
              onChange={(e) => uploadJwk(e)}
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
