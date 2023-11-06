import { Link } from 'react-router-dom';

import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { BrandLogo } from '../../icons';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  const [, dispatchRegisterState] = useRegistrationState();

  return (
    <div className="flex flex-column" style={{ gap: '0px' }}>
      <div className="navbar">
        <div className="flex-row flex-left">
          <Link
            className="hover"
            to="/"
            onClick={() => {
              dispatchRegisterState({ type: 'reset' });
            }}
          >
            <div style={{ position: 'relative' }}>
              <BrandLogo width={'36px'} height={'36px'} fill={'white'} />

              {/* TODO: Conditionally show testnet depending on environment when mainnet becomes available */}
              <div
                className="testnet"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '24px',
                }}
              >
                Testnet
              </div>
            </div>
          </Link>
        </div>
        <NavGroup />
      </div>
      <Breadcrumbs />
    </div>
  );
}

export default NavBar;
