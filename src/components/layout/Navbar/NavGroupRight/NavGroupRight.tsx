import './styles.css';
import NavBarLink from '../NavBarLink/NavBarLink';

const NavGroupRight = () => {
  return (
    <div className="navGroupRight">
      <NavBarLink path="/about" linkText="About" />
      <NavBarLink path="/faq" linkText="FAQs" />
    </div>
  );
};

export default NavGroupRight;
