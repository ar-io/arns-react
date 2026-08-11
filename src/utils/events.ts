import EventEmitter from 'eventemitter3';

/**
 * Note: we could potentially use a context provider for notifications, but this is fairly lightweight.
 */
const eventEmitter = new EventEmitter();

export default eventEmitter;
