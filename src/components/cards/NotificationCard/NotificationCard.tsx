import { useEffect } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import './styles.css';

export function NotificationCard({
  notification,
  expireSecs = 5,
}: {
  notification: { id: string; text: string };
  expireSecs?: number;
}) {
  const [{}, dispatchGlobalState] = useGlobalState(); // eslint-disable-line
  useEffect(() => {
    setTimeout(() => {
      dispatchGlobalState({
        type: 'removeNotification',
        payload: notification.id,
      });
    }, expireSecs * 1000);
  }, [expireSecs]);
  return <div className="notification white text">{notification.text}</div>;
}
