import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import useIsMobile from '../../../hooks/useIsMobile/useIsMobile.js';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  const isMobile = useIsMobile();

  return (
    <div className="navBar">
      <div className="navBarItemContainer">
        <Link to="/">
          <img src={logo} className="brandLogo" alt="logo" />
        </Link>
      </div>
      {/* TODO: create hamburger menu */}
      {!isMobile ? <NavGroup position="right" /> : <></>}
    </div>
  );
}

export default NavBar;
