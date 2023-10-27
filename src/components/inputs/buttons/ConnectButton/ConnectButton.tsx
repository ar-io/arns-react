import { useNavigate } from 'react-router-dom';

import { useWalletState } from '../../../../state/contexts/WalletState';
import './styles.css';

function ConnectButton(): JSX.Element {
  const [{ walletStateInitialized }] = useWalletState();
  const navigate = useNavigate();
  return (
    <button
      className="connect-button"
      style={{ textDecoration: 'none' }}
      onClick={() => navigate('connect')}
      disabled={walletStateInitialized}
    >
      Connect
    </button>
  );
}

export default ConnectButton;
