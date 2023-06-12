import * as Sentry from '@sentry/react';
import { notification } from 'antd';
import { useEffect } from 'react';

import eventEmitter from '../../../utils/events';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function Notifications() {
  const [api, contextHolder] = notification.useNotification({
    maxCount: 3,
  });

  function handleError(error: Error) {
    const sentryID = Sentry.captureException(error);
    console.debug('Error sent to sentry:', error, sentryID);
    showNotification({
      type: 'error',
      title: error.name,
      description: error.message,
    });
  }

  function showNotification({
    type,
    title,
    description,
  }: {
    type: NotificationType;
    title: string;
    description: string;
  }) {
    api[type]({
      message: title,
      description,
      placement: 'bottomRight',
      style: {
        fontFamily: 'Rubik',
      },
    });
  }

  // error notifications
  useEffect(() => {
    eventEmitter.on('error', (error: Error) => handleError(error));

    return () => {
      eventEmitter.off('error');
    };
  });

  return contextHolder;
}
