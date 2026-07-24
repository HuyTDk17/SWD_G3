const aiService = require('../services/aiService');

const aiController = {
  async getQuota(req, res, next) {
    try {
      const data = await aiService.getQuota(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listSessions(req, res, next) {
    try {
      const data = await aiService.listSessions(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createSession(req, res, next) {
    try {
      const { type, targetLanguage } = req.body;
      const data = await aiService.createSession(req.user.id, type, targetLanguage);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSession(req, res, next) {
    try {
      const { id } = req.params;
      const data = await aiService.getSession(req.user.id, id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const data = await aiService.sendMessage(req.user.id, id, content);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async checkGrammar(req, res, next) {
    try {
      const { text, targetLanguage } = req.body;
      const data = await aiService.checkGrammar(req.user.id, text, targetLanguage);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getStudyRecommendation(req, res, next) {
    try {
      const data = await aiService.getStudyRecommendation(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = aiController;
