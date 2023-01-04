import { NotificationCard } from '../../cards/NotificationCard/NotificationCard';
import './styles.css';

export function Notifications({
  notifications,
}: {
  notifications: { id: string; text: string }[];
}) {
  return (
    <div className="bottom fixed">
      {[...notifications].map((notification: { id: string; text: string }) => (
        <div key={notification.id}>
          <NotificationCard notification={notification} />
        </div>
      ))}
    </div>
  );
}
