import * as Sentry from '@sentry/react';
import { notification } from 'antd';
import { ArgsProps } from 'antd/es/notification/interface';
import { useEffect } from 'react';

import eventEmitter from '../../../utils/events';
import { defaultError } from './error';
import './styles.css';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const ARCONNECT_UNRESPONSIVE_ERROR =
  'There was an issue initializing ArConnect. Please reload the page to initialize.';

export default function Notifications() {
  const [notificationApi, contextHolder] = notification.useNotification({
    maxCount: 3,
  });

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

  function getNotificationProps({
    type,
    title,
    description,
    key,
  }: {
    type: NotificationType;
    title: string;
    description: string;
    key: string;
  }): ArgsProps {
    switch (type) {
      case 'error':
        if (description === ARCONNECT_UNRESPONSIVE_ERROR) {
          return defaultError({
            closeCallback: () => notificationApi.destroy(),
            actionCallback: () => location.reload(),
            actionText: 'Reload',
            title,
            description,
            key,
          });
        }
        return defaultError({
          closeCallback: () => notificationApi.destroy(),
          actionCallback: () => notificationApi.destroy(),
          actionText: 'Close',
          title,
          description,
          key,
        });
      default:
        return {
          message: '',
        };
    }
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
    const key = `open${Date.now()}`;
    const notificationProps = getNotificationProps({
      type,
      title,
      description,
      key,
    });
    notificationApi[type](notificationProps);
  }

  // error notifications
  useEffect(() => {
    eventEmitter.on('error', handleError);

    return () => {
      eventEmitter.off('error', handleError);
    };
  });

  return contextHolder;
}
