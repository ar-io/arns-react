import { useStateValue } from '../../../../state/state.js';
import './styles.css';

function ConnectButton(): JSX.Element {
  const [{}, dispatch] = useStateValue(); // eslint-disable-line

  function showConnectModal() {
    dispatch({
      type: 'setConnectWallet',
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
