import { Link } from 'react-router-dom';

import { ExternalLinkOutlined } from '../../icons';

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
          gap: '.5em',
          textDecoration: 'none',
          position: 'relative',
          fontSize: '18px',
          border: '1px solid var(--text-faded)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
          }}
        >
          <ExternalLinkOutlined
            width={'18px'}
            height={'18px'}
            fill={'var(--text-grey)'}
          />
        </div>

        {body}
      </div>
    </Link>
  );
}

export default ActionCard;
