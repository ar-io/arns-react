import { Link } from 'react-router-dom';
//import * as logo from '../../../../assets/images/logo/winston-white.gif';
// TODO: the above import causes the error 'Type 'typeof import("*.gif")' is not assignable to type 'string'.'
// we should fix this instead of hard coding the path in the img src

function NavBar() {
  return (
    <div className="navBar">
      <div className="navBarItemContainer">
        <Link to="/" className="brandLogo">
          <img
            src={'../../../../assets/images/logo/winston-white.gif'}
            width={90}
            height={90}
          />
        </Link>
      </div>
    </div>
  );
}

export default NavBar;
