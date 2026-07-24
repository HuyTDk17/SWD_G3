const expireEnrollments = require('./expireEnrollments');
const cleanupOrphanMedia = require('./cleanupOrphanMedia');

const HOUR_MS = 60 * 60 * 1000;

/**
 * Starts all background jobs. Called once from server.js after the DB
 * connects. Uses plain setInterval rather than a cron library to avoid
 * adding a new dependency for a project this size.
 */
function startJobs() {
  // Run once shortly after boot, then on a recurring schedule.
  setTimeout(() => {
    expireEnrollments().catch((err) => console.error('[JOB] expireEnrollments failed:', err.message));
    cleanupOrphanMedia().catch((err) => console.error('[JOB] cleanupOrphanMedia failed:', err.message));
  }, 10_000);

  setInterval(() => {
    expireEnrollments().catch((err) => console.error('[JOB] expireEnrollments failed:', err.message));
  }, HOUR_MS);

  setInterval(() => {
    cleanupOrphanMedia().catch((err) => console.error('[JOB] cleanupOrphanMedia failed:', err.message));
  }, 6 * HOUR_MS);

  console.log('[JOBS] Background jobs scheduled (expireEnrollments hourly, cleanupOrphanMedia every 6h).');
}

module.exports = startJobs;
