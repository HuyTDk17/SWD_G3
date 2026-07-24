const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['conversation', 'grammar', 'grading', 'recommendation'],
    default: 'conversation'
  },
  targetLanguage: {
    type: String,
    default: 'JavaScript'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'model', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

aiSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AiSession', aiSessionSchema);
