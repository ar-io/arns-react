import { Link } from 'react-router-dom';

import './styles.css';

function ConnectButton(): JSX.Element {
  return (
    <Link
      className="connect-button"
      style={{ textDecoration: 'none' }}
      to="connect"
    >
      Connect
    </Link>
  );
}

export default ConnectButton;
