const mongoose = require('mongoose');

const questionOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Question must belong to a quiz'],
    index: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'fill_blank', 'listening', 'speaking', 'matching', 'open_ended'],
    default: 'multiple_choice'
  },
  prompt: {
    type: String,
    required: [true, 'Please provide a prompt/question text'],
    trim: true
  },
  options: {
    type: [questionOptionSchema],
    default: []
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // ID of option, string answer or array
    required: true
  },
  points: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    required: [true, 'Please provide question order']
  },
  explanation: {
    type: String,
    default: ''
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

questionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);
