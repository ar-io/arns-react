import { Link } from 'react-router-dom';

import logo from '../../../../assets/images/logo/winston-white.gif';
import NavGroupRight from './NavGroupRight/NavGroupRight';
import './styles.css';

function NavBar() {
  return (
    <div className="navBar">
      <div className="navBarItemContainer">
        <Link to="/" className="brandLogo">
          <img src={logo} width={90} height={90} alt="logo" />
        </Link>
      </div>

      <NavGroupRight />
    </div>
  );
}

export default NavBar;
