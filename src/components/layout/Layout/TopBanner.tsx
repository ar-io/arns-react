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
      Expect disruptions as we migrate to AO. &apos;Purchase&apos; interactions
      are temporarily paused, but you can still manage assets during this time.{' '}
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
