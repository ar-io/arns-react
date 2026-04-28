import { useIsMobile } from '@src/hooks';
import { SOLANA_MIGRATION_LINK } from '@src/utils/constants';
import { ExternalLinkIcon } from 'lucide-react';
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
      <strong>Ar.io is migrating to Solana!</strong> Purchases are paused and
      will resume shortly. Register before the May 15, 2026 snapshot!{' '}
      <Link
        to={SOLANA_MIGRATION_LINK}
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
        Learn More{' '}
        <ExternalLinkIcon
          size={14}
          style={{ display: 'inline', verticalAlign: 'middle' }}
        />
      </Link>
    </div>
  );
};

export default TopBanner;
