import PQueue  from 'p-queue';
const pQueue = new PQueue({
  concurrency: 3,
  interval: 2000,
  intervalCap: 5,
  carryoverConcurrencyCount: true,
  timeout: 30000,
});

pQueue.on('idle', () => {
  console.log(`Queue is idle.  Size: ${pQueue.size}  Pending: ${pQueue.pending}`);
});

let count = 0;
pQueue.on('active', () => {
  console.log(`Working on item #${++count}.  Size: ${pQueue.size}  Pending: ${pQueue.pending}`);
});


export default pQueue;
