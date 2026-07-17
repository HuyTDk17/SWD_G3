const userService = require('../services/userService');

const userController = {
  async getMe(req, res, next) {
    try {
      const data = await userService.getProfile(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req, res, next) {
    try {
      const data = await userService.updateProfile(req.user.id, req.validated);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async setAvatar(req, res, next) {
    try {
      const data = await userService.setAvatar(req.user.id, req.validated.assetId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async submitTeacherApplication(req, res, next) {
    try {
      const data = await userService.submitTeacherApplication(req.user.id, req.validated);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getMyTeacherApplication(req, res, next) {
    try {
      const data = await userService.getMyTeacherApplication(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listTeacherApplications(req, res, next) {
    try {
      const { items, meta } = await userService.listTeacherApplications(req.query);
      res.json({ success: true, data: items, meta });
    } catch (error) {
      next(error);
    }
  },

  async reviewTeacherApplication(req, res, next) {
    try {
      const data = await userService.reviewTeacherApplication(
        req.params.id,
        req.user.id,
        req.validated
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listUsers(req, res, next) {
    try {
      const { items, meta } = await userService.listUsers(req.query);
      res.json({ success: true, data: items, meta });
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const data = await userService.updateUserStatus(
        req.user.id,
        req.params.id,
        req.validated.status
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const data = await userService.updateUserRole(
        req.user.id,
        req.params.id,
        req.validated.role
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
