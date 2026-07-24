const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  notifiedAt: {
    type: Date,
    default: null
  }
});

// A student can only be on a course's waitlist once
waitlistSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
