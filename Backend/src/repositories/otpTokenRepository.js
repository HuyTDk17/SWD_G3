const OtpToken = require('../models/OtpToken');

const otpTokenRepository = {
  create(data) {
    return OtpToken.create(data);
  },

  findActiveByUserAndType(userId, type) {
    return OtpToken.findOne({
      userId,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
  },

  invalidateByUserAndType(userId, type) {
    return OtpToken.updateMany(
      { userId, type, isUsed: false },
      { isUsed: true }
    );
  },

  markUsed(id) {
    return OtpToken.findByIdAndUpdate(id, { isUsed: true }, { new: true });
  },

  incrementAttempts(id) {
    return OtpToken.findByIdAndUpdate(
      id,
      { $inc: { attempts: 1 } },
      { new: true }
    );
  }
};

module.exports = otpTokenRepository;
