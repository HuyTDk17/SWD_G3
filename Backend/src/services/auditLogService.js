const AuditLog = require('../models/AuditLog');

const auditLogService = {
  async log({ actorId, action, targetType, targetId, details, ipAddress }) {
    try {
      await AuditLog.create({
        actorId,
        action,
        targetType,
        targetId,
        details,
        ipAddress
      });
    } catch (err) {
      console.error('[AUDIT LOGGER EXCEPTION]', err);
    }
  },

  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const items = await AuditLog.find({})
      .populate('actorId', 'name email fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments({});
    return {
      items,
      total,
      pages: Math.ceil(total / limit)
    };
  }
};

module.exports = auditLogService;
