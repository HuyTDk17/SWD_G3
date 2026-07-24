const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description']
    },
    language: {
        type: String,
        default: 'JavaScript',
        enum: ['HTML/CSS', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'SQL', 'NoSQL', 'Git']
    },
    cefrLevel: {
        type: String,
        required: [true, 'CEFR level is required'],
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'A1'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
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
    thumbnailAssetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MediaAsset',
        default: null
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide a teacher']
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'published', 'rejected', 'archived'],
        default: 'draft'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    capacity: {
        type: Number,
        default: null // null = unlimited
    },
    durationDays: {
        type: Number,
        default: null
    },
    isSequential: {
        type: Boolean,
        default: true
    },
    lessonCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date,
        default: null
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

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

courseSchema.pre('validate', function (next) {
    if (!this.slug && this.title) {
        this.slug = slugify(this.title);
    }
    next();
});

courseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Course', courseSchema);

