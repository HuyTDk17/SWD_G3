const express = require('express');
const configRouter = express.Router();
const configService = require('../services/configService');

// Public: anyone browsing the course catalog needs these filter options,
// so this intentionally has no authMiddleware (unlike /admin/config).
configRouter.get('/public', async (req, res, next) => {
  try {
    const [categories, cefrLevels] = await Promise.all([
      configService.getByKey('categories'),
      configService.getByKey('cefr_levels')
    ]);
    res.json({
      success: true,
      data: {
        categories: categories.value,
        cefrLevels: cefrLevels.value
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = configRouter;
