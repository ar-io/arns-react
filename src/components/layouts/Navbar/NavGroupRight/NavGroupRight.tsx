import './styles.css';
import NavBarLink from '../NavBarLink/NavBarLink';

const NavGroupRight = () => {
  return (
    <div className="navGroupRight">
      <NavBarLink path="/about" linkText="About" />
      <NavBarLink path="/faq" linkText="FAQ" />
    </div>
  );
}

export default NavGroupRight;
