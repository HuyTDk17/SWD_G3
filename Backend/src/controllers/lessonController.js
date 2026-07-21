const lessonService = require('../services/lessonService');

const lessonController = {
  async list(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;
      
      const data = await lessonService.getLessons(courseId, userId, role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getDetail(req, res, next) {
    try {
      const { courseId, id } = req.params;
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;

      const data = await lessonService.getLessonDetail(userId, role, courseId, id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { courseId } = req.params;
      const data = await lessonService.createLesson(req.user.id, req.user.role, courseId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = await lessonService.updateLesson(req.user.id, req.user.role, id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await lessonService.deleteLesson(req.user.id, req.user.role, id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      const { courseId } = req.params;
      const { lessonIds } = req.body;
      const data = await lessonService.reorderLessons(req.user.id, req.user.role, courseId, lessonIds);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async complete(req, res, next) {
    try {
      const { courseId, id } = req.params;
      const data = await lessonService.completeLesson(req.user.id, courseId, id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = lessonController;
