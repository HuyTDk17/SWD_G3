const mongoose = require('mongoose');

const quizAttemptAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  value: {
    type: String, // student selection or text answer
    default: ''
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  answers: {
    type: [quizAttemptAnswerSchema],
    default: []
  },
  score: {
    type: Number,
    default: null // Percentage: 0 - 100
  },
  isPassed: {
    type: Boolean,
    default: null
  },
  gradingStatus: {
    type: String,
    enum: ['pending', 'auto_graded', 'ai_graded'],
    default: 'auto_graded'
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: null
  },
  timeSpentSeconds: {
    type: Number,
    default: null
  }
});

quizAttemptSchema.index({ quizId: 1, studentId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
