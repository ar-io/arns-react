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
      <div
        className="flex-row flex-space-between"
        style={{
          boxSizing: 'border-box',
          padding: '0px 100px',
          minHeight: 75,
        }}
      >
        <div className="flex-row flex-left">
          <Link
            className="hover"
            to="/"
            onClick={() => {
              dispatchRegisterState({ type: 'reset' });
            }}
          >
            <BrandLogo width={'36px'} height={'36px'} fill={'white'} />
          </Link>
        </div>
        <NavGroup />
      </div>
      <Breadcrumbs />
    </div>
  );
}

export default NavBar;
