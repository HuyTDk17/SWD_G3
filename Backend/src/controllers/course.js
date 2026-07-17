const Course = require('../models/Course');


const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const add = async (req, res) => {
    try {
        const { title, description, language, price, image, teacherId } = req.body;

        if (!title || !description || price === undefined || !teacherId) {
            return res.status(400).json({ message: 'title, description, price và teacherId là bắt buộc' });
        }

        const newCourse = new Course({ title, description, language, price, image, teacherId });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, language, price, image, teacherId } = req.body;

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { title, description, language, price, image, teacherId, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
    getAllCourses,
    getCourseById,
    add,
    updateCourse,
    deleteCourse,
};