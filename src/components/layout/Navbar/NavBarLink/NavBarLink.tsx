import { Link } from 'react-router-dom';

import './styles.css';

type navBarLink = {
  path: string;
  linkText: string;
  target?: string;
  onClick?: () => void;
  children?: JSX.Element;
  activityDot?: boolean;
};

function NavBarLink({
  path,
  linkText,
  target = '_self',
  onClick,
  activityDot,

  children,
}: navBarLink) {
  return (
    <div className="relative flex items-center">
      <Link
        to={path}
        target={target}
        onClick={() => (onClick ? onClick() : null)}
        className="navbar-link hover flex flex-row items-center gap-2.5 text-foreground"
        state={{ from: target, to: target }}
      >
        {children}
        {linkText}
      </Link>
      {activityDot && (
        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 h-2 w-2 animate-ping rounded-full bg-primary" />
      )}
    </div>
  );
}

export default NavBarLink;
