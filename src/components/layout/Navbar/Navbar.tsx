import { Link } from 'react-router-dom';
import logo from '../../../../assets/images/logo/winston-white.gif';

function NavBar() {
  return (
    <div className="navBarItemContainer">
      <Link to="/" className="brandLogo">
        <img src={logo} width={90} height={90} />
      </Link>
    </div>
  );
}

export default NavBar;
