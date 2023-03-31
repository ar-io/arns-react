import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  const [, dispatchRegisterState] = useRegistrationState();

  return (
    <div className="flex-row flex-space-between">
      <div className="flex-row flex-left">
        <Link
          className="hover"
          to="/"
          onClick={() => {
            dispatchRegisterState({ type: 'reset' });
          }}
        >
          <img src={logo} className="brand-logo" alt="logo" />
        </Link>
      </div>
      <NavGroup />
    </div>
  );
}

export default NavBar;
