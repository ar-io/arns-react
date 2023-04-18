import * as Sentry from '@sentry/react';
import EventEmitter from 'eventemitter3';

/**
 * Note: we could potentially use a context provider for notifications, but this is fairly lightweight and makes it easy to send errors to sentry.
 */
const eventEmitter = new EventEmitter();

eventEmitter.on('error', handleError);

function handleError(error: Event) {
  // send to sentry, if enabled
  console.debug(error);
  const sentryID = Sentry.captureException(error);
  console.debug('Error sent to sentry:', sentryID);
}

export default eventEmitter;
