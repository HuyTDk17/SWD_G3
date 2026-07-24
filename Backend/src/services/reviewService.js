const reviewRepository = require('../repositories/reviewRepository');
const courseRepository = require('../repositories/courseRepository');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const notificationService = require('./notificationService');
const ERROR_CODES = require('../constants/errorCodes');
const ValidationError = require('../exceptions/ValidationError');
const ForbiddenError = require('../exceptions/ForbiddenError');
const NotFoundError = require('../exceptions/NotFoundError');

const reviewService = {
  async createReview(studentId, courseId, data) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    // BR-REVIEW-001: Enrolled to Review
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      throw new ForbiddenError('You must enroll in this course first to write a review', ERROR_CODES.FORBIDDEN);
    }

    // BR-REVIEW-002: Single Review Check
    const existing = await Review.findOne({ studentId, courseId });
    if (existing) {
      throw new ValidationError('You have already submitted a review for this course', [
        { field: 'studentId', message: 'Duplicate review submitted' }
      ]);
    }

    const payload = {
      studentId,
      courseId,
      rating: Number(data.rating),
      comment: data.comment || '',
      status: 'pending' // BR-REVIEW-003: Review starts as pending
    };

    const review = await reviewRepository.create(payload);
    return review;
  },

  async getCourseReviews(courseId) {
    return reviewRepository.findByCourseId(courseId, { status: 'approved' });
  },

  async getPendingReviews(userId, role) {
    if (role !== 'admin') {
      throw new ForbiddenError('Only administrators can access pending reviews', ERROR_CODES.FORBIDDEN);
    }
    return reviewRepository.findPendingReviews();
  },

  async moderateReview(userId, role, id, status) {
    if (role !== 'admin') {
      throw new ForbiddenError('Only administrators can moderate reviews', ERROR_CODES.FORBIDDEN);
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new ValidationError('Invalid moderation status');
    }

    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found', ERROR_CODES.NOT_FOUND);
    }

    const updated = await reviewRepository.updateStatus(id, status);

    // Dynamic rating aggregation sync (Step 9 integration)
    const stats = await reviewRepository.aggregateCourseRating(review.courseId._id);
    const averageRating = stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0;

    await courseRepository.updateById(review.courseId._id, {
      averageRating,
      reviewCount: stats.reviewCount
    });

    // Notify course teacher about new review (Step 11 integration)
    const course = await courseRepository.findById(review.courseId._id);
    if (course && status === 'approved') {
      await notificationService.createNotification(
        course.teacherId._id,
        'New Course Review! ⭐',
        `A student left a ${review.rating}-star review on your course "${course.title}".`,
        'course'
      );
    }

    return updated;
  },

  async updateReview(studentId, reviewId, data) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found', ERROR_CODES.NOT_FOUND);
    if (review.studentId._id.toString() !== studentId.toString()) {
      throw new ForbiddenError('You can only edit your own review', ERROR_CODES.FORBIDDEN);
    }

    const updated = await reviewRepository.updateContent(reviewId, {
      rating: Number(data.rating),
      comment: data.comment || ''
    });

    // Editing changes the rating value, so re-sync the course's aggregate rating.
    await reviewService.syncCourseRating(review.courseId._id);
    return updated;
  },

  async deleteReview(userId, role, reviewId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found', ERROR_CODES.NOT_FOUND);

    const isOwner = review.studentId._id.toString() === userId.toString();
    if (!isOwner && role !== 'admin') {
      throw new ForbiddenError('You can only delete your own review', ERROR_CODES.FORBIDDEN);
    }

    await reviewRepository.deleteById(reviewId);
    await reviewService.syncCourseRating(review.courseId._id);
    return { message: 'Review deleted' };
  },

  async flagReview(userId, reviewId, reason) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review not found', ERROR_CODES.NOT_FOUND);

    const alreadyFlagged = (review.flags || []).some((f) => f.userId.toString() === userId.toString());
    if (alreadyFlagged) {
      throw new ValidationError('You have already flagged this review');
    }

    return reviewRepository.addFlag(reviewId, userId, reason || '');
  },

  async getFlaggedReviews(role) {
    if (role !== 'admin') {
      throw new ForbiddenError('Only administrators can access flagged reviews', ERROR_CODES.FORBIDDEN);
    }
    return reviewRepository.findFlagged();
  },

  async syncCourseRating(courseId) {
    const stats = await reviewRepository.aggregateCourseRating(courseId);
    const averageRating = stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0;
    await courseRepository.updateById(courseId, {
      averageRating,
      reviewCount: stats.reviewCount
    });
  }
};

module.exports = reviewService;
