const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
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
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).json({ message: 'studentId và courseId là bắt buộc' });
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

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const newEnrollment = await Enrollment.create({ studentId, courseId });
        res.status(201).json(newEnrollment);
    } catch (error) {
        console.log('ERROR:', error.message);
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
        const enrollment = await Enrollment.findByIdAndDelete(id);
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        res.status(200).json({ message: 'Unenrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllEnrollments,
    enroll,
    getEnrolledCourses,
    togglePin,
    unenroll,
};