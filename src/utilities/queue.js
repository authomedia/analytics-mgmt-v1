import throttledQueue from 'throttled-queue';
export default throttledQueue(5, 1000, true);
