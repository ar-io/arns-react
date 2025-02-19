import {
  ARIO_DEVNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { BrandLogo } from '../../icons';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import NavGroup from './NavGroup/NavGroup';
import NetworkStatusBanner from './NetworkStatusBanner/NetworkStatusBanner';
import './styles.css';

function NavBar() {
  const [{ arioProcessId }] = useGlobalState();
  const [, dispatchRegisterState] = useRegistrationState();

  const bannerText = useMemo(() => {
    if (arioProcessId == ARIO_DEVNET_PROCESS_ID) {
      return `Devnet`;
    } else if (arioProcessId == ARIO_TESTNET_PROCESS_ID) {
      return `Testnet`;
    }
    return undefined;
  }, [arioProcessId]);

  return (
    <div
      className="flex flex-column"
      style={{ gap: '0px', position: 'relative' }}
    >
      <NetworkStatusBanner />
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

              {/* TODO: Conditionally show tesnet/devnet depending on process id */}
              {bannerText && (
                <div
                  className="testnet"
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '24px',
                  }}
                >
                  {bannerText}
                </div>
              )}
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
