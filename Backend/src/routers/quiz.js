const express = require('express');
const quizRouter = express.Router({ mergeParams: true });
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

quizRouter.get('/', optionalAuthMiddleware, quizController.list);
quizRouter.get('/:id', optionalAuthMiddleware, quizController.getById);

quizRouter.post('/', authMiddleware, roleGuard(ROLES.TEACHER), quizController.create);
quizRouter.put('/:id', authMiddleware, roleGuard(ROLES.TEACHER), quizController.update);
quizRouter.delete('/:id', authMiddleware, roleGuard(ROLES.TEACHER, ROLES.ADMIN), quizController.delete);

quizRouter.post('/:id/attempts', authMiddleware, roleGuard(ROLES.STUDENT), quizController.startAttempt);
quizRouter.get('/:id/attempts/:attemptId', authMiddleware, roleGuard(ROLES.STUDENT), quizController.getAttemptResult);
quizRouter.post('/:id/attempts/:attemptId/submit', authMiddleware, roleGuard(ROLES.STUDENT), quizController.submitAttempt);

module.exports = quizRouter;
