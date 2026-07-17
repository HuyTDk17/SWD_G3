const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/userStatus');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    default: null
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STUDENT
  },
  avatar: {
    type: String,
    default: null
  },
  avatarAssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  targetLanguages: {
    type: [String],
    default: []
  },
  nativeLanguage: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    default: null,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  aiQuotaLimit: {
    type: Number,
    default: 50
  },
  aiQuotaUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
