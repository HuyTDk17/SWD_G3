const courseService = require('../services/courseService');

const courseController = {
  async list(req, res, next) {
    try {
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;
      const { items, meta } = await courseService.listCourses(req.query, userId, role);
      res.json({ success: true, data: items, meta });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;
      const data = await courseService.getCourseById(req.params.id, userId, role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;
      const data = await courseService.getCourseBySlug(req.params.slug, userId, role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const data = await courseService.createCourse(req.user.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = await courseService.updateCourse(
        req.user.id,
        req.user.role,
        req.params.id,
        req.body
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await courseService.deleteCourse(
        req.user.id,
        req.user.role,
        req.params.id
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async submit(req, res, next) {
    try {
      const data = await courseService.submitCourse(req.user.id, req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const data = await courseService.approveCourse(req.user.id, req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async reject(req, res, next) {
    try {
      const data = await courseService.rejectCourse(
        req.user.id,
        req.params.id,
        req.body.rejectionReason
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async publish(req, res, next) {
    try {
      const data = await courseService.publishCourse(req.user.id, req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async archive(req, res, next) {
    try {
      const data = await courseService.archiveCourse(
        req.user.id,
        req.user.role,
        req.params.id
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = courseController;
