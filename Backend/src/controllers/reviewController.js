const reviewService = require('../services/reviewService');

const reviewController = {
  async submitReview(req, res, next) {
    try {
      const { courseId } = req.params;
      const data = await reviewService.createReview(req.user.id, courseId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listCourseReviews(req, res, next) {
    try {
      const { courseId } = req.params;
      const data = await reviewService.getCourseReviews(courseId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listPendingReviews(req, res, next) {
    try {
      const data = await reviewService.getPendingReviews(req.user.id, req.user.role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async moderateReview(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await reviewService.moderateReview(req.user.id, req.user.role, id, status);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const data = await reviewService.updateReview(req.user.id, id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const data = await reviewService.deleteReview(req.user.id, req.user.role, id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async flagReview(req, res, next) {
    try {
      const { id } = req.params;
      const data = await reviewService.flagReview(req.user.id, id, req.body.reason);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listFlaggedReviews(req, res, next) {
    try {
      const data = await reviewService.getFlaggedReviews(req.user.role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reviewController;
