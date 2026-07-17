const mongoose = require('mongoose');

const OTP_TYPES = {
  EMAIL_VERIFY: 'email_verify',
  PASSWORD_RESET: 'password_reset'
};

const otpTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  codeHash: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(OTP_TYPES),
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpTokenSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);
module.exports.OTP_TYPES = OTP_TYPES;
