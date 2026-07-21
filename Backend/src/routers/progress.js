const express = require('express');
const progressRouter = express.Router({ mergeParams: true });
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middlewares/authMiddleware');

progressRouter.get('/', authMiddleware, progressController.getProgressDetails);

module.exports = progressRouter;
