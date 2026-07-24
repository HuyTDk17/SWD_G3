const mediaService = require('../services/mediaService');

/**
 * FR-MEDIA-005: Delete uploaded media assets that were never attached to
 * anything (lesson, avatar, course thumbnail, credential document...) and
 * are older than 24 hours, to avoid deleting files mid-upload flow.
 */
async function cleanupOrphanMedia() {
  const result = await mediaService.cleanupOrphanAssets(24);
  if (result.scanned > 0) {
    console.log(`[MEDIA CLEANUP] Scanned ${result.scanned}, deleted ${result.deletedCount}, failed ${result.failedCount}.`);
  }
  return result;
}

module.exports = cleanupOrphanMedia;
