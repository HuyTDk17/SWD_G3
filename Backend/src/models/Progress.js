const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
    unique: true
  },
  completionPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  lessonsCompleted: {
    type: Number,
    required: true,
    default: 0
  },
  totalLessons: {
    type: Number,
    required: true,
    default: 0
  },
  quizzesPassed: {
    type: Number,
    required: true,
    default: 0
  },
  studyTimeMinutes: {
    type: Number,
    required: true,
    default: 0
  },
  currentStreak: {
    type: Number,
    required: true,
    default: 0
  },
  longestStreak: {
    type: Number,
    required: true,
    default: 0
  },
  lastStudiedAt: {
    type: Date,
    default: null
  },
  milestones: {
    type: [String],
    default: []
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

progressSchema.index({ studentId: 1, courseId: 1 });

progressSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
