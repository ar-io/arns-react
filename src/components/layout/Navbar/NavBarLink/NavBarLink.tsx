import { Link } from 'react-router-dom';

import './styles.css';

type navBarLink = {
  path: string;
  linkText: string;
  children?: JSX.Element;
};

function NavBarLink({ path, linkText, children }: navBarLink) {
  return (
    <Link
      to={path}
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
