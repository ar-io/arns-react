import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = (props: { position?: string } = { position: 'left' }) => {
  const { position } = props;
  const justifyContent = position === 'left' ? 'flex-start' : 'flex-end';
  return (
    <div
      className="navGroup"
      style={{
        justifyContent: justifyContent,
      }}
    >
      <NavBarLink path="/about" linkText="About" />
      <NavBarLink path="/faq" linkText="FAQs" />
      <ConnectButton />
    </div>
  );
};

export default NavGroup;
