const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a student']
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Please provide a course']
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired'],
        default: 'active'
    },
    expiresAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    completionPercent: {
        type: Number,
        default: 0
    }
});

// Prevent duplicate enrollment
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
