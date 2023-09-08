import * as Sentry from '@sentry/react';
import { notification } from 'antd';
import { useEffect, useState } from 'react';

import eventEmitter from '../../../utils/events';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function Notifications() {
  const [api, contextHolder] = notification.useNotification({
    maxCount: 3,
  });
  const [previousErrorMessage, setPreviousErrorMessage] = useState<{
    message: string;
    timestamp: number;
  }>();

  function handleError(error: Error) {
    // TODO: check for duplicate errors
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
    eventEmitter.on('error', (error: Error) => {
      if (
        error.message === previousErrorMessage?.message &&
        Date.now() - previousErrorMessage?.timestamp < 5000
      ) {
        return;
      }
      setPreviousErrorMessage({
        message: error.message,
        timestamp: Date.now(),
      });
      handleError(error);
    });

    return () => {
      eventEmitter.off('error');
    };
  });

  return contextHolder;
}
