import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { BellIcon } from '../../icons';

const ReservedNameNotificationCard = () => {
  const message = (
    <span>
      This name is currently reserved. Please reach out to us on{' '}
      <a
        target="_blank"
        href={ARIO_DISCORD_LINK}
        rel="noreferrer"
        className="link text-medium"
        style={{ display: 'inline' }}
      >
        Discord
      </a>{' '}
      for more information.
    </span>
  );

  return (
    <div
      className="flex flex-column flex-center radius"
      style={{
        border: 'solid 1px var(--text-faded)',
        padding: 50,
        boxSizing: 'border-box',
      }}
    >
      <BellIcon width={'30px'} height={'30px'} fill="var(--text-grey)" />

      <div className="flex flex-column" style={{ maxWidth: '400px' }}>
        <span
          className="text white center"
          style={{ fontSize: '18px', maxWidth: '' }}
        >
          {message}
        </span>
      </div>
    </div>
  );
};

export default ReservedNameNotificationCard;
