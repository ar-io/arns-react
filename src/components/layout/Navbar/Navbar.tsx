import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { BrandLogo } from '../../icons';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  const [, dispatchRegisterState] = useRegistrationState();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
    return () => {
      window.removeEventListener('online', () => setOnline(true));
      window.removeEventListener('offline', () => setOnline(false));
    };
  }, []);

  return (
    <div
      className="flex flex-column"
      style={{ gap: '0px', position: 'relative' }}
    >
      {online ? null : (
        <div
          className="flex flex-row center"
          style={{
            backgroundColor: 'var(--accent)',
            padding: '10px',
          }}
        >
          <span className="text black bold">
            We can&apos;t connect to the Internet. Please check your connection
            and try again.
          </span>
        </div>
      )}
      <div className="navbar" style={{ position: 'relative' }}>
        <div className="flex-row flex-left" style={{ width: 'fit-content' }}>
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
        <div className="flex px-4"></div>

        <NavGroup />
      </div>
      <Breadcrumbs />
    </div>
  );
}

export default NavBar;
