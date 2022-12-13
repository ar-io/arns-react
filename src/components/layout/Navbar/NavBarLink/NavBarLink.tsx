import { Link } from 'react-router-dom';

import './styles.css';

type navBarLink = {
  path: string;
  linkText: string;
};

function NavBarLink({ path, linkText }: navBarLink) {
  return (
    <Link to={path} className="navbar-link hover">
      {linkText}
    </Link>
  );
}

export default NavBarLink;
