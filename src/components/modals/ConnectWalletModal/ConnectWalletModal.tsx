import ArConnectIcon from '../../../assets/images/DarkMode/ArConnectIcon.png';
import ArweaveAppIcon from '../../../assets/images/DarkMode/ArweaveAppIcon.png';
import { FiUpload, FiX } from 'react-icons/fi';
import { useState } from 'react';

type ConnectWalletModal = {
  setConnected: any;
};

function ConnectWalletModal({ setConnected }: ConnectWalletModal) {
  const [clickOut, setClickOut] = useState(false);

  return (
    <div
      className="modalContainer"
      onClick={
        clickOut
          ? () => setConnected(false)
          : () => console.log('select a wallet')
      }
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
            setConnected(false);
          }}
        >
          <FiX size={'25px'} color={'white'} />
        </button>
        <button className="walletConnectButton">
          <FiUpload color="white" size={'47px'} />
          Import your JSON keyfile
        </button>
        <button className="walletConnectButton">
          <img src={ArConnectIcon} alt="" width="47px" height="47px" />
          Connect via ArConnect
        </button>
        <button className="walletConnectButton">
          <img src={ArweaveAppIcon} alt="" width="47px" height="47px" />
          Connect using Arweave.app
        </button>
        <text className="textFaded" style={{ marginTop: '1em' }}>
          Don't have a wallet? get one{' '}
          <a
            href="http://arwiki.wiki"
            style={{ color: 'inherit', marginLeft: '4px' }}
          >
            {' '}
            here
          </a>
        </text>
      </div>
    </div>
  );
}
export default ConnectWalletModal;
