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
    <div className="relative">
      <Link
        to={path}
        target={target}
        onClick={() => (onClick ? onClick() : null)}
        className={
          children ? 'navbar-link hover flex-row' : 'navbar-link hover'
        }
        style={{
          gap: '10px',
          alignItems: 'center',
          color: 'var(--text-white)',
        }}
        state={{ from: target, to: target }}
      >
        {children}
        {linkText}
      </Link>
      {activityDot && (
        <div className="absolute right-[-8px] top-[0px] h-2 w-2 animate-ping rounded-full bg-primary" />
      )}
    </div>
  );
}

export default NavBarLink;
