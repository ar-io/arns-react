import winston from '../../../assets/images/DarkMode/winston-logo.png';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import { Link } from 'react-router-dom';

type navBar = {
  connected: Boolean;
  setConnected: any;
};

function NavBar({ connected, setConnected }: navBar) {
  return (
    <div className="navBar">
      <div className="navBarItemContainer">
        <Link to="/Home" className="brandLogo">
          <img src={winston} width={90} height={90} />
        </Link>
      </div>

      <div className="navBarItemContainer">
        <Link to="/About" className="navBarLink">
          <div>About</div>
        </Link>
        <Link to="/FAQ" className="navBarLink">
          <div>FAQs</div>
        </Link>
        <ConnectButton connected={connected} setConnected={setConnected} />
      </div>
    </div>
  );
}

export default NavBar;
