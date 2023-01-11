import { Link } from 'react-router-dom';

import './styles.css';

type navBarLink = {
  path: string;
  linkText: string;
  onClick?: () => void;
  children?: JSX.Element;
};

function NavBarLink({ path, linkText, onClick, children }: navBarLink) {
  return (
    <Link
      to={path}
      onClick={() => (onClick ? onClick() : null)}
      className={
        children
          ? 'flex-row flex-space-between navbar-link hover'
          : 'navbar-link hover'
      }
    >
      {linkText}
      {children}
    </Link>
  );
}

export default NavBarLink;
