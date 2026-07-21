const express = require('express');
const courseRouter = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

const lessonRouter = require('./lesson');
const quizRouter = require('./quiz');
const progressRouter = require('./progress');
const reviewRouter = require('./review');

courseRouter.get('/', optionalAuthMiddleware, courseController.list);
courseRouter.get('/slug/:slug', optionalAuthMiddleware, courseController.getBySlug);
courseRouter.get('/:id', optionalAuthMiddleware, courseController.getById);

courseRouter.post('/', authMiddleware, roleGuard(ROLES.TEACHER), courseController.create);
courseRouter.put('/:id', authMiddleware, roleGuard(ROLES.TEACHER, ROLES.ADMIN), courseController.update);
courseRouter.delete('/:id', authMiddleware, roleGuard(ROLES.TEACHER, ROLES.ADMIN), courseController.delete);

courseRouter.post('/:id/submit', authMiddleware, roleGuard(ROLES.TEACHER), courseController.submit);
courseRouter.post('/:id/approve', authMiddleware, roleGuard(ROLES.ADMIN), courseController.approve);
courseRouter.post('/:id/reject', authMiddleware, roleGuard(ROLES.ADMIN), courseController.reject);
courseRouter.post('/:id/publish', authMiddleware, roleGuard(ROLES.TEACHER), courseController.publish);
courseRouter.post('/:id/archive', authMiddleware, roleGuard(ROLES.TEACHER, ROLES.ADMIN), courseController.archive);

// Nested lessons route
courseRouter.use('/:courseId/lessons', lessonRouter);

// Nested quizzes route
courseRouter.use('/:courseId/quizzes', quizRouter);

// Nested progress route
courseRouter.use('/:courseId/progress', progressRouter);

// Nested reviews route
courseRouter.use('/:courseId/reviews', reviewRouter);

module.exports = courseRouter;