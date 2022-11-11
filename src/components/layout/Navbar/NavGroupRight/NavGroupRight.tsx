import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroupRight = () => {
  return (
    <div className="navGroupRight">
      <NavBarLink path="/about" linkText="About" />
      <NavBarLink path="/faq" linkText="FAQs" />
      <ConnectButton />
    </div>
  );
};

export default NavGroupRight;
