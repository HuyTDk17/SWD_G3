const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

adminRouter.use(authMiddleware, roleGuard(ROLES.ADMIN));

adminRouter.get('/audit-logs', adminController.getAuditLogs);
adminRouter.get('/config', adminController.getConfig);
adminRouter.patch('/config', adminController.updateConfig);

module.exports = adminRouter;
