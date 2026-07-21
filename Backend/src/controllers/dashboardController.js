const dashboardService = require('../services/dashboardService');

const dashboardController = {
  async getStudentDashboard(req, res, next) {
    try {
      const data = await dashboardService.getStudentDashboard(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getTeacherDashboard(req, res, next) {
    try {
      const data = await dashboardService.getTeacherDashboard(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminDashboard(req, res, next) {
    try {
      const data = await dashboardService.getAdminDashboard();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async exportCSV(req, res, next) {
    try {
      const csv = await dashboardService.generateCSVReport();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users_enrollments_report.csv');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
