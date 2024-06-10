import { Link } from 'react-router-dom';

const TopBanner = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor: 'var(--accent)',
        color: 'var(--text-black)',
        padding: '12px 18px',
        fontSize: '14px',
      }}
    >
      Expect service disruptions as ArNS is migrated to AO. New name
      registrations and lease extensions are temporarily paused, but you may be
      able to manage existing assets during this time.{' '}
      <Link
        to="https://twitter.com/ar_io_network"
        target="_blank"
        rel="noreferrer"
        className="link hover"
        style={{
          display: 'inline',
          color: 'var(--text-black)',
          textDecoration: 'underline',
          fontWeight: 600,
        }}
      >
        Follow along
      </Link>{' '}
      for updates.
    </div>
  );
};

export default TopBanner;
