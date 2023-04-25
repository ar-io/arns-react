import EventEmitter from 'eventemitter3';

/**
 * Note: we could potentially use a context provider for notifications, but this is fairly lightweight and makes it easy to send errors to sentry.
 */
const eventEmitter = new EventEmitter();

export default eventEmitter;
