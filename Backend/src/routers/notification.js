const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');
const notificationValidators = require('../validators/notificationValidator');
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

// All notification feeds and settings actions are protected by authMiddleware
notificationRouter.use(authMiddleware);

notificationRouter.get('/', notificationController.getMyNotifications);
notificationRouter.patch('/:id/read', notificationController.markAsRead);
notificationRouter.post('/read-all', notificationController.markAllAsRead);

notificationRouter.get('/preferences', notificationController.getPreferences);
notificationRouter.put('/preferences', notificationController.updatePreferences);

notificationRouter.post(
  '/broadcast',
  roleGuard(ROLES.ADMIN),
  validate(notificationValidators.broadcastAnnouncement),
  notificationController.broadcastAnnouncement
);

module.exports = notificationRouter;
