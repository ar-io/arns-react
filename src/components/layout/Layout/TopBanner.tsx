import { useIsMobile } from '@src/hooks';
import { ARIO_DISCORD_LINK } from '@src/utils/constants';
import { Link } from 'react-router-dom';

const TopBanner = () => {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor: 'var(--accent)',
        color: 'var(--text-black)',
        padding: isMobile ? '12px 15px' : '12px 18px',
        fontSize: '14px',
      }}
    >
      ArNS name purchases and upgrades are temporarily unavailable during the
      migration to Hyperbeam (AO Mainnet). Existing names can still be modified.
      Follow updates in{' '}
      <Link
        to={ARIO_DISCORD_LINK}
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
        Discord
      </Link>
      .
    </div>
  );
};

export default TopBanner;
