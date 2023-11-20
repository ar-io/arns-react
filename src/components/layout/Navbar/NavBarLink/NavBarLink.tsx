import { Link } from 'react-router-dom';

import './styles.css';

type navBarLink = {
  path: string;
  linkText: string;
  target?: string;
  onClick?: () => void;
  children?: JSX.Element;
};

function NavBarLink({
  path,
  linkText,
  target = '_self',
  onClick,
  children,
}: navBarLink) {
  return (
    <Link
      to={path}
      target={target}
      onClick={() => (onClick ? onClick() : null)}
      className={children ? 'flex-row navbar-link hover' : 'navbar-link hover'}
      style={{ gap: '10px', alignItems: 'center', color: 'var(--text-white)' }}
    >
      {children}
      {linkText}
    </Link>
  );
}

export default NavBarLink;
