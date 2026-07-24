const quizService = require('../services/quizService');

const quizController = {
  async list(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;
      
      const data = await quizService.getQuizzes(courseId, userId, role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { courseId, id } = req.params;
      const userId = req.optionalUser?.id || null;
      const role = req.optionalUser?.role || null;

      const data = await quizService.getQuizById(courseId, id, userId, role);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { courseId } = req.params;
      const data = await quizService.createQuiz(req.user.id, req.user.role, courseId, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { courseId, id } = req.params;
      const data = await quizService.updateQuiz(req.user.id, req.user.role, courseId, id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { courseId, id } = req.params;
      const result = await quizService.deleteQuiz(req.user.id, req.user.role, courseId, id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async startAttempt(req, res, next) {
    try {
      const { courseId, id } = req.params;
      const data = await quizService.startAttempt(req.user.id, courseId, id);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async submitAttempt(req, res, next) {
    try {
      const { courseId, id, attemptId } = req.params;
      const data = await quizService.submitAttempt(
        req.user.id,
        courseId,
        id,
        attemptId,
        req.body.answers
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAttemptResult(req, res, next) {
    try {
      const { courseId, id, attemptId } = req.params;
      const data = await quizService.getAttemptResult(
        req.user.id,
        req.user.role,
        id,
        attemptId
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const data = await quizService.getQuizAnalytics(req.user.id, req.user.role, id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = quizController;
