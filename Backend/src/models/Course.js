const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description']
    },
    language: {
        type: String,
        default: 'English',
        enum: ['English', 'Vietnamese', 'French', 'Spanish', 'Chinese']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a course price'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: null
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a teacher']
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

courseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Course', courseSchema);
