import { Link } from 'react-router-dom';

function ActionCard({ to, body }: { to: string; body?: JSX.Element | string }) {
  return (
    <Link
      to={to}
      className="link hover"
      style={{ textDecoration: 'none', width: '100%' }}
    >
      <div
        className="flex flex-column center white radius"
        style={{
          minWidth: '175px',
          minHeight: '100px',
          width: '100%',
          padding: '0px',
          gap: '15px',
          textDecoration: 'none',
          position: 'relative',
          fontSize: '18px',
          border: '1px solid var(--text-faded)',
        }}
      >
        {body}
      </div>
    </Link>
  );
}

export default ActionCard;
