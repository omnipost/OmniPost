import Bull from 'bull';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/* ── Publish Queue ─────────────────────────────────────────── */
export const publishQueue = new Bull('omnipost:publish', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

/* ── Analytics Fetch Queue ─────────────────────────────────── */
export const analyticsQueue = new Bull('omnipost:analytics', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: 50,
  },
});

/* ── Token Refresh Queue ───────────────────────────────────── */
export const tokenRefreshQueue = new Bull('omnipost:token-refresh', REDIS_URL, {
  defaultJobOptions: { attempts: 3, backoff: { type: 'fixed', delay: 3000 } },
});

/* ── Event logging ─────────────────────────────────────────── */
[publishQueue, analyticsQueue, tokenRefreshQueue].forEach(q => {
  q.on('completed', (job) => logger.info(`Queue [${q.name}] job ${job.id} completed`));
  q.on('failed',    (job, err) => logger.error(`Queue [${q.name}] job ${job.id} failed: ${err.message}`));
  q.on('stalled',   (job) => logger.warn(`Queue [${q.name}] job ${job.id} stalled`));
});

logger.info('📬 Bull queues initialised');
