import async = 'async';
import backoff from 'backoff';

import throttledQueue from 'throttled-queue';

const enqueue = throttledQueue(5, 1000, true);

const promiseQueue = (callback) => {
  return new Promise((resolve, reject) => {
    return queue(callback);
  });
}

export {
  promiseQueue,
  backoffQueue
}

const
