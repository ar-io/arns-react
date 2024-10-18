import { useLocation, useNavigate } from 'react-router-dom';

import './styles.css';

function ConnectButton(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      data-testid="connect-button"
      className="connect-button"
      style={{ textDecoration: 'none' }}
      onClick={() => {
        navigate('/connect', {
          state: { from: location.pathname, to: location.pathname },
        });
      }}
    >
      Connect
    </button>
  );
}

export default ConnectButton;
