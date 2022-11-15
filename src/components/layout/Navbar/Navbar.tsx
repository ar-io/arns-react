import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import useIsMobile from '../../../hooks/useIsMobile/useIsMobile';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  const isMobile = useIsMobile();

  return (
    <div className="flex-row flex-space-between">
      <div className="flex-row flex-left">
        <Link to="/">
          <img src={logo} className="brandLogo" alt="logo" />
        </Link>
      </div>
      {/* TODO: create hamburger menu */}
      {!isMobile ? <NavGroup /> : <></>}
    </div>
  );
}

export default NavBar;
