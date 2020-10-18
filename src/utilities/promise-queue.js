import throttledQueue from 'throttled-queue';

const enqueue = throttledQueue(5, 1000, true);

export default function(callback) {
  return new Promise((resolve, reject) => {
    return queue(callback);
  });
}
