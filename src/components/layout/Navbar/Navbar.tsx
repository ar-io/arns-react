import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import NavGroup from './NavGroup/NavGroup';
import './styles.css';

function NavBar() {
  const [showNavMenu, setShowNavMenu] = useState(true);

  useEffect(() => {
    // make sure we resize when loading small screen
    updateNavMenu();
    window.addEventListener('resize', updateNavMenu);
  }, [showNavMenu]);

  function updateNavMenu() {
    const width = window.innerWidth;
    if (width < 600) {
      setShowNavMenu(false);
      return;
    }
    setShowNavMenu(true);
    return;
  }

  return (
    <div className="navBar">
      <div className="navBarItemContainer">
        <Link to="/">
          <img src={logo} className="brandLogo" alt="logo" />
        </Link>
      </div>
      {/* TODO: create hamburger menu */}
      {showNavMenu ? <NavGroup position="left" /> : <></>}
    </div>
  );
}

export default NavBar;
