const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

// These can be mounted nested under courses or globally
// Dynamic course-specific reviews endpoints
reviewRouter.post('/', authMiddleware, roleGuard(ROLES.STUDENT), reviewController.submitReview);
reviewRouter.get('/', reviewController.listCourseReviews);

// Global Admin moderation endpoints
reviewRouter.get('/pending', authMiddleware, roleGuard(ROLES.ADMIN), reviewController.listPendingReviews);
reviewRouter.post('/:id/moderate', authMiddleware, roleGuard(ROLES.ADMIN), reviewController.moderateReview);

module.exports = reviewRouter;
