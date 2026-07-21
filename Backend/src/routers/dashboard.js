const express = require('express');
const dashboardRouter = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

dashboardRouter.use(authMiddleware);

dashboardRouter.get('/student', roleGuard(ROLES.STUDENT), dashboardController.getStudentDashboard);
dashboardRouter.get('/teacher', roleGuard(ROLES.TEACHER), dashboardController.getTeacherDashboard);
dashboardRouter.get('/admin', roleGuard(ROLES.ADMIN), dashboardController.getAdminDashboard);
dashboardRouter.get('/admin/export', roleGuard(ROLES.ADMIN), dashboardController.exportCSV);

module.exports = dashboardRouter;
