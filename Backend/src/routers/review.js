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
reviewRouter.patch('/:id', authMiddleware, roleGuard(ROLES.STUDENT), reviewController.updateReview);
reviewRouter.delete('/:id', authMiddleware, reviewController.deleteReview);
reviewRouter.post('/:id/flag', authMiddleware, reviewController.flagReview);

// Global Admin moderation endpoints
reviewRouter.get('/pending', authMiddleware, roleGuard(ROLES.ADMIN), reviewController.listPendingReviews);
reviewRouter.get('/flagged', authMiddleware, roleGuard(ROLES.ADMIN), reviewController.listFlaggedReviews);
reviewRouter.post('/:id/moderate', authMiddleware, roleGuard(ROLES.ADMIN), reviewController.moderateReview);

module.exports = reviewRouter;
