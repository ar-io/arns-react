import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  // eslint-disable-next-line
  const [{}, dispatchRegisterState] = useRegistrationState();
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  return (
    <div className="flex-row flex-space-between">
      <div className="flex-row flex-left">
        <Link
          className="hover"
          to="/"
          onClick={() => {
            setSearchParams();
            dispatchRegisterState({ type: 'reset' });
            navigate('/');
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
