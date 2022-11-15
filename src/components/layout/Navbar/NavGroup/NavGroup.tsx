import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = () => {
  return (
    <div className="flex-row flex-right flex-padding">
      <NavBarLink path="/about" linkText="About" />
      <NavBarLink path="/faq" linkText="FAQs" />
      <ConnectButton />
    </div>
  );
};

export default NavGroup;
