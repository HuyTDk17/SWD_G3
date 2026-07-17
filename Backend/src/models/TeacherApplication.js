const mongoose = require('mongoose');

const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const teacherApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  credentials: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  languagesTaught: {
    type: [String],
    required: true,
    validate: {
      validator: (languages) => languages.length > 0,
      message: 'At least one teaching language is required'
    }
  },
  documentUrls: {
    type: [String],
    default: []
  },
  documentAssetIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'MediaAsset',
    default: []
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.PENDING,
    index: true
  },
  adminFeedback: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

teacherApplicationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('TeacherApplication', teacherApplicationSchema);
module.exports.APPLICATION_STATUS = APPLICATION_STATUS;
