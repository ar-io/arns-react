import { useNavigate } from 'react-router-dom';

import './styles.css';

function ConnectButton(): JSX.Element {
  const navigate = useNavigate();
  return (
    <button
      className="connect-button"
      style={{ textDecoration: 'none' }}
      onClick={() => navigate('connect')}
    >
      Connect
    </button>
  );
}

export default ConnectButton;
