const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// All notification feeds and settings actions are protected by authMiddleware
notificationRouter.use(authMiddleware);

notificationRouter.get('/', notificationController.getMyNotifications);
notificationRouter.patch('/:id/read', notificationController.markAsRead);
notificationRouter.post('/read-all', notificationController.markAllAsRead);

notificationRouter.get('/preferences', notificationController.getPreferences);
notificationRouter.put('/preferences', notificationController.updatePreferences);

module.exports = notificationRouter;
