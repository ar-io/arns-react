import { ARIO_DISCORD_LINK } from '@src/utils/constants';
import { Link } from 'react-router-dom';

const CalloutBanner = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor: 'var(--accent)',
        color: 'var(--text-black)',
        padding: '12px 18px',
        fontSize: '14px',
        borderRadius: 'var(--corner-radius)',
      }}
    >
      ANTs associated with registered names will soon be migrated as-is from
      Smartweave to AO using a new standardized format. If you have customized
      or additional ANTs you would like to migrate, contact us via{' '}
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
      </Link>{' '}
      for assistance.
    </div>
  );
};

export default CalloutBanner;
