const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  progressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress',
    required: true,
    index: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
    index: true
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpentMinutes: {
    type: Number,
    required: true,
    default: 0
  }
});

// Enforce unique lesson progress tracking per student progress document
lessonProgressSchema.index({ progressId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
