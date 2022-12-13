import { useStateValue } from '../../../../state/state';
import './styles.css';

function ConnectButton(): JSX.Element {
  const [{}, dispatch] = useStateValue(); // eslint-disable-line

  function showConnectModal() {
    dispatch({
      type: 'setShowConnectWallet',
      payload: true,
    });
  }
  return (
    <>
      <button className="connectButton" onClick={showConnectModal}>
        Connect
      </button>
    </>
  );
}

export default ConnectButton;
