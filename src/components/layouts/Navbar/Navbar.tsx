import { Link } from 'react-router-dom';
import './styles.css'
import logo from '../../../../assets/images/logo/winston-white.gif';
import NavGroupRight from './NavGroupRight/NavGroupRight';
import NavBarLink from './NavBarLink/NavBarLink';

function NavBar() {
  return (
    <div className='navBar'>
    <div className="navBarItemContainer">
      <Link to="/" className="brandLogo">
        <img src={logo} width={90} height={90} />
      </Link>
    </div>
    wewedw
     <NavGroupRight />
     <NavBarLink 
     path=''
     linkText='test'
     />
     </div>
  );
}

export default NavBar;
