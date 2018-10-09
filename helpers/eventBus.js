import EventEmitter from 'events';

/**
 * @class customEventEmitter
 * @extends {EventEmitter}
 */
class customEventEmitter extends EventEmitter {}

const eventBus = new customEventEmitter();

export default eventBus;
