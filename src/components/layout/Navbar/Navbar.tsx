import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  // eslint-disable-next-line
  const [{}, dispatchGlobalState] = useGlobalState();
  return (
    <div className="flex-row flex-space-between">
      <div className="flex-row flex-left">
        <Link
          className="hover"
          to="/"
          onClick={() =>
            dispatchGlobalState({ type: 'setIsSearching', payload: false })
          }
        >
          <img src={logo} className="brandLogo" alt="logo" />
        </Link>
      </div>
      <NavGroup />
    </div>
  );
}

export default NavBar;
