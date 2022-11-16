import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  return (
    <div className="flex-row flex-space-between">
      <div className="flex-row flex-left">
        <Link to="/">
          <img src={logo} className="brandLogo" alt="logo" />
        </Link>
      </div>
      <NavGroup />
    </div>
  );
}

export default NavBar;
