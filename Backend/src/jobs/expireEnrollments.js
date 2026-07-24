const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const notificationService = require('../services/notificationService');

/**
 * FR-ENROLL-006: Enrollments with a set expiry date that has passed are
 * flipped from 'active' to 'expired', and the student is notified.
 * Enrollments with no expiresAt (expiresAt: null) never expire.
 */
async function expireEnrollments() {
  const now = new Date();
  const expired = await Enrollment.find({
    status: 'active',
    expiresAt: { $ne: null, $lt: now }
  });

  if (!expired.length) {
    return { expiredCount: 0 };
  }

  for (const enrollment of expired) {
    enrollment.status = 'expired';
    await enrollment.save();

    try {
      const course = await Course.findById(enrollment.courseId).select('title');
      await notificationService.createNotification(
        enrollment.studentId,
        'Course Access Expired',
        `Your access to "${course ? course.title : 'a course'}" has expired. Re-enroll to continue learning.`,
        'course'
      );
    } catch (error) {
      console.error('[EXPIRE ENROLLMENTS] Failed to notify student:', error.message);
    }
  }

  console.log(`[EXPIRE ENROLLMENTS] Expired ${expired.length} enrollment(s).`);
  return { expiredCount: expired.length };
}

module.exports = expireEnrollments;
