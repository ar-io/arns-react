import winston from '../../../assets/images/DarkMode/winston-white.gif';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <div className="navBar">
      <div className="navBarItemContainer">
        <Link to="/" className="brandLogo">
          <img src={winston} width={90} height={90} />
        </Link>
      </div>
    </div>
  );
}

export default NavBar;
