const express = require('express');
const courseRouter = express.Router();
const { getAllCourses, getCourseById, add, updateCourse, deleteCourse } = require('../controllers/course');

courseRouter.get('/courses', getAllCourses);
courseRouter.get('/courses/:id', getCourseById);
courseRouter.post('/courses', add);
courseRouter.put('/courses/:id', updateCourse);
courseRouter.delete('/courses/:id', deleteCourse);

module.exports = courseRouter;