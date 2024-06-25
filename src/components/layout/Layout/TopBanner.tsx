import { ARIO_DISCORD_LINK } from '@src/utils/constants';
import { Link } from 'react-router-dom';

const TopBanner = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor: 'var(--success-green)',
        color: 'var(--text-black)',
        padding: '12px 18px',
        fontSize: '14px',
      }}
    >
      AO migration is complete! All functionality should now be returned to
      normal. Please let us know in{' '}
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
      if you encounter any bugs or issues.
    </div>
  );
};

export default TopBanner;
