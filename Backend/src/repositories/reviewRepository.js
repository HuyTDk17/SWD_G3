const Review = require('../models/Review');

const reviewRepository = {
  create(data) {
    return Review.create(data);
  },

  findById(id) {
    return Review.findById(id).populate('studentId').populate('courseId');
  },

  findByCourseId(courseId, filter = {}) {
    return Review.find({ courseId, ...filter })
      .populate({
        path: 'studentId',
        select: 'name email role'
      })
      .sort({ createdAt: -1 });
  },

  findPendingReviews() {
    return Review.find({ status: 'pending' })
      .populate({
        path: 'studentId',
        select: 'name email'
      })
      .populate({
        path: 'courseId',
        select: 'title language slug'
      })
      .sort({ createdAt: -1 });
  },

  updateStatus(id, status) {
    return Review.findByIdAndUpdate(id, { status }, { new: true });
  },

  updateContent(id, { rating, comment }) {
    return Review.findByIdAndUpdate(id, { rating, comment, status: 'pending' }, { new: true });
  },

  addFlag(id, userId, reason) {
    return Review.findByIdAndUpdate(
      id,
      { $push: { flags: { userId, reason } } },
      { new: true }
    );
  },

  findFlagged() {
    return Review.find({ 'flags.0': { $exists: true } })
      .populate({ path: 'studentId', select: 'name email' })
      .populate({ path: 'courseId', select: 'title language slug' })
      .sort({ updatedAt: -1 });
  },

  deleteById(id) {
    return Review.findByIdAndDelete(id);
  },

  async aggregateCourseRating(courseId) {
    const result = await Review.aggregate([
      { $match: { courseId, status: 'approved' } },
      {
        $group: {
          _id: '$courseId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);
    return result[0] || { averageRating: 0, reviewCount: 0 };
  }
};

module.exports = reviewRepository;
