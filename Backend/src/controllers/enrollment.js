const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const mongoose = require('mongoose');

const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('studentId')
            .populate('courseId');
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const enroll = async (req, res) => {
    try {
        console.log('BODY:', req.body);
        const { courseId } = req.body;
        const studentId = req.user.id; // Using authenticated user id

        if (!courseId) {
            return res.status(400).json({ message: 'courseId là bắt buộc' });
        }

        // Tìm bằng cả string lẫn ObjectId
        const course = await Course.findOne({
            $or: [
                { _id: courseId },
                { _id: mongoose.isValidObjectId(courseId) ? new mongoose.Types.ObjectId(courseId) : null }
            ]
        });
        console.log('COURSE:', course);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId: course._id });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // BR-ENROLL-002: Expiration days calculation
        const expiresAt = course.durationDays ? new Date(Date.now() + course.durationDays * 24 * 60 * 60 * 1000) : null;

        const newEnrollment = await Enrollment.create({
            studentId,
            courseId: course._id,
            status: 'active',
            expiresAt
        });

        // Initialize progress
        const publishedLessons = await Lesson.find({ courseId: course._id, status: 'published' }).sort({ order: 1 });
        const progress = await Progress.create({
            studentId,
            courseId: course._id,
            enrollmentId: newEnrollment._id,
            totalLessons: publishedLessons.length,
            completionPercent: 0,
            lessonsCompleted: 0
        });

        for (const lesson of publishedLessons) {
            await LessonProgress.create({
                progressId: progress._id,
                lessonId: lesson._id,
                isCompleted: false
            });
        }

        res.status(201).json(newEnrollment);
    } catch (error) {
        console.log('ERROR:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyEnrollments = async (req, res) => {
    try {
        const studentId = req.user.id;
        const enrollments = await Enrollment.find({ studentId }).populate('courseId');
        
        // Dynamically append completion percent from Progress
        const result = [];
        for (const item of enrollments) {
            const progress = await Progress.findOne({ studentId, courseId: item.courseId?._id });
            result.push({
                ...item.toObject(),
                completionPercent: progress ? progress.completionPercent : 0
            });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getEnrolledCourses = async (req, res) => {
    try {
        const { studentId } = req.params;
        const enrollments = await Enrollment.find({ studentId }).populate('courseId');
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await Enrollment.findById(id);
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        // Verify ownership
        if (enrollment.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        enrollment.isPinned = !enrollment.isPinned;
        await enrollment.save();
        res.status(200).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const unenroll = async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await Enrollment.findById(id);
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Verify ownership
        if (enrollment.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Enrollment.findByIdAndDelete(id);
        
        // Cleanup student Progress & LessonProgress
        const progress = await Progress.findOneAndDelete({ studentId: req.user.id, courseId: enrollment.courseId });
        if (progress) {
            await LessonProgress.deleteMany({ progressId: progress._id });
        }

        res.status(200).json({ message: 'Unenrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllEnrollments,
    enroll,
    getMyEnrollments,
    getEnrolledCourses,
    togglePin,
    unenroll,
};