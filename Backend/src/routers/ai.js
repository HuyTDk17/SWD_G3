const express = require('express');
const aiRouter = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

aiRouter.use(authMiddleware);

aiRouter.get('/quota', aiController.getQuota);
aiRouter.get('/sessions', aiController.listSessions);
aiRouter.post('/sessions', aiController.createSession);
aiRouter.get('/sessions/:id', aiController.getSession);
aiRouter.post('/sessions/:id/messages', aiController.sendMessage);

module.exports = aiRouter;
