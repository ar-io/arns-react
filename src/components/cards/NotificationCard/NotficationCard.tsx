import { useEffect } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState.js';
import './styles.css';

export function NotificationCard({
  message,
  expire = 5,
}: {
  message: string;
  expire?: number;
}) {
  const [{}, dispatchGlobalState] = useGlobalState();
  useEffect(() => {
    setTimeout(() => {
      dispatchGlobalState({
        type: 'removeNotification',
        payload: message,
      });
    }, expire * 1000);
  }, [expire]);
  return <div className="notification white text">{message}</div>;
}
