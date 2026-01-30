import * as Sentry from '@sentry/react';
import { useToast } from '@src/components/ui/Toast';
import { NotificationOnlyError } from '@src/utils/errors';
import { ReactNode, useEffect } from 'react';

import eventEmitter from '../../../utils/events';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const WANDER_UNRESPONSIVE_ERROR =
  'There was an issue initializing Wander. Please reload the page to initialize.';

export default function Notifications() {
  const { addToast, clearToasts } = useToast();

  function handleError(error: Error | { message: string; name: string }) {
    // TODO: check for duplicate errors
    if (error instanceof Error && !(error instanceof NotificationOnlyError)) {
      const sentryID = Sentry.captureException(error);
      console.debug('Error sent to sentry:', error, sentryID);
    }

    const isWanderUnresponsive = error.message === WANDER_UNRESPONSIVE_ERROR;

    addToast({
      type: 'error',
      title: error.name,
      description: error.message,
      action: {
        label: isWanderUnresponsive ? 'Reload' : 'Close',
        onClick: isWanderUnresponsive ? () => location.reload() : () => clearToasts(),
      },
    });
  }

  function handleSuccess({
    message,
    name,
  }: {
    message: ReactNode;
    name: string;
  }) {
    addToast({
      type: 'success',
      title: name,
      description: message,
    });
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

  return null; // Toast rendering is handled by ToastProvider
}
