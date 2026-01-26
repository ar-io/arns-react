import * as Sentry from '@sentry/react';
import { NotificationOnlyError } from '@src/utils/errors';
import { notification } from 'antd';
import { ArgsProps } from 'antd/es/notification/interface';
import { ReactNode, useEffect } from 'react';

import eventEmitter from '../../../utils/events';
import { defaultError } from './error';
import './styles.css';
import { defaultSuccess } from './success';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const WANDER_UNRESPONSIVE_ERROR =
  'There was an issue initializing Wander. Please reload the page to initialize.';

export default function Notifications() {
  const [notificationApi, contextHolder] = notification.useNotification({
    maxCount: 3,
  });

  function handleError(error: Error | { message: string; name: string }) {
    // TODO: check for duplicate errors
    if (error instanceof Error && !(error instanceof NotificationOnlyError)) {
      const sentryID = Sentry.captureException(error);
      console.debug('Error sent to sentry:', error, sentryID);
    }

    showNotification({
      type: 'error',
      title: error.name,
      description: error.message,
    });
  }

  function handleSuccess({
    message,
    name,
  }: {
    message: ReactNode;
    name: string;
  }) {
    showNotification({
      type: 'success',
      title: name,
      description: message,
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
    description: ReactNode;
    key: string;
  }): ArgsProps {
    switch (type) {
      case 'error': {
        const wanderUnresponsive = description === WANDER_UNRESPONSIVE_ERROR;

        return defaultError({
          closeCallback: () => notificationApi.destroy(),
          actionCallback: wanderUnresponsive
            ? () => location.reload()
            : () => notificationApi.destroy(),
          actionText: wanderUnresponsive ? 'Reload' : 'Close',
          title,
          description,
          key,
        });
      }
      case 'success': {
        return defaultSuccess({
          closeCallback: () => notificationApi.destroy(),
          title,
          description,
          key,
        });
      }
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
    description: ReactNode;
  }) {
    if (!title?.length) {
      return;
    }
    //if (typeof description == 'string' && !description.length) return;
    const key = `open${Date.now()}`;
    const notificationProps = getNotificationProps({
      type,
      title: title?.length ? title : 'Error',
      description,
      key,
    });
    notificationApi[type](notificationProps);
  }

  // error notifications
  useEffect(() => {
    eventEmitter.on('success', handleSuccess);
    eventEmitter.on('error', handleError);

    return () => {
      eventEmitter.off('error', handleError);
      eventEmitter.off('success', handleSuccess);
    };
  });

  return contextHolder;
}
