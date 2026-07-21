const express = require('express');
// mergeParams enables accessing :courseId from the parent router mounting
const lessonRouter = express.Router({ mergeParams: true });
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

lessonRouter.get('/', optionalAuthMiddleware, lessonController.list);
lessonRouter.get('/:id', optionalAuthMiddleware, lessonController.getDetail);

lessonRouter.post('/', authMiddleware, roleGuard(ROLES.TEACHER), lessonController.create);
lessonRouter.put('/:id', authMiddleware, roleGuard(ROLES.TEACHER, ROLES.ADMIN), lessonController.update);
lessonRouter.delete('/:id', authMiddleware, roleGuard(ROLES.TEACHER, ROLES.ADMIN), lessonController.delete);

lessonRouter.post('/reorder', authMiddleware, roleGuard(ROLES.TEACHER), lessonController.reorder);
lessonRouter.post('/:id/complete', authMiddleware, roleGuard(ROLES.STUDENT), lessonController.complete);

module.exports = lessonRouter;
