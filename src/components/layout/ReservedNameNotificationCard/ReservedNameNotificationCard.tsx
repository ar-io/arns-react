import { BellIcon } from '../../icons';

const ReservedNameNotificationCard = () => {
  const message = (
    <span>
      Names that are 4 characters and less are currently not available for
      purchase.
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
