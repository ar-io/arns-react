import { BellIcon } from '../../icons';

type ReservedNameNotificationCardProps = {
  domain: string;
};

const ReservedNameNotificationCard = ({
  domain,
}: ReservedNameNotificationCardProps) => {
  console.log('domain', domain);
  const message =
    'Arweave ecosystem project names are currently reserved. Please reach out to us on Discord for more information.';

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
