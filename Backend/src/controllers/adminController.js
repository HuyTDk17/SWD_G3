const configService = require('../services/configService');
const auditLogService = require('../services/auditLogService');

const adminController = {
  async getAuditLogs(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await auditLogService.list(page, limit);
      res.json({
        success: true,
        data: data.items,
        meta: { page, limit, total: data.total, pages: data.pages }
      });
    } catch (error) {
      next(error);
    }
  },

  async getConfig(req, res, next) {
    try {
      const data = await configService.listAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateConfig(req, res, next) {
    try {
      const { key, value } = req.body;
      const config = await configService.update(key, value, req.user.id);

      // Log this action in the Audit trail (Step 14 requirement)
      await auditLogService.log({
        actorId: req.user.id,
        action: 'config.update',
        targetType: 'SystemConfig',
        targetId: config._id,
        details: { key, value },
        ipAddress: req.ip || req.connection.remoteAddress
      });

      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
