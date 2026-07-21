const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: { type: String, required: true },
  translation: { type: String, required: true },
  pronunciation: { type: String, default: '' }
});

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Lesson must belong to a course'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: [true, 'Please provide a lesson order (sequence number)']
  },
  contentType: {
    type: [String],
    default: ['text'],
    enum: ['video', 'audio', 'text', 'vocabulary', 'grammar']
  },
  videoAssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  audioAssetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset',
    default: null
  },
  textContent: {
    type: String,
    default: ''
  },
  vocabulary: {
    type: [vocabularySchema],
    default: []
  },
  grammarNotes: {
    type: String,
    default: ''
  },
  resourceAssetIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'MediaAsset',
    default: []
  },
  estimatedMinutes: {
    type: Number,
    default: 15
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
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

// Enforce unique lesson order per course
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

lessonSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lesson', lessonSchema);
