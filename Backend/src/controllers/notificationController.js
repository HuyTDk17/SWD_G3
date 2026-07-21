const notificationService = require('../services/notificationService');

const notificationController = {
  async getMyNotifications(req, res, next) {
    try {
      const data = await notificationService.getMyNotifications(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const data = await notificationService.markAsRead(req.user.id, id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  },

  async getPreferences(req, res, next) {
    try {
      const data = await notificationService.getPreferences(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const data = await notificationService.updatePreferences(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;
