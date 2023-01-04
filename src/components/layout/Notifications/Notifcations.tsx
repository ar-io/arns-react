import { NotificationCard } from '../../cards/NotificationCard/NotficationCard.js';
import './styles.css';

export function Notifications({
  notifications,
}: {
  notifications: Set<string>;
}) {
  return (
    <div className="bottom fixed">
      {[...notifications].map((e) => (
        <NotificationCard message={e} />
      ))}
    </div>
  );
}
