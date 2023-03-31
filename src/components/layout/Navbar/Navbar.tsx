import { useNavigate, useSearchParams } from 'react-router-dom';

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
        <button
          className="hover"
          onClick={() => {
            setSearchParams();
            dispatchRegisterState({ type: 'reset' });
            navigate('/');
          }}
        >
          <img src={logo} className="brand-logo" alt="logo" />
        </button>
      </div>
      <NavGroup />
    </div>
  );
}

export default NavBar;
