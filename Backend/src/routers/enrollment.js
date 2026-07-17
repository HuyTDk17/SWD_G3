const express = require('express');
const enrollmentRouter = express.Router();
const { enroll, getAllEnrollments, getEnrolledCourses, togglePin, unenroll } = require('../controllers/enrollment');

// Các route cụ thể phải đặt TRƯỚC route động /:id
enrollmentRouter.get('/', getAllEnrollments);
enrollmentRouter.post('/enroll', enroll);

// Route động đặt SAU
enrollmentRouter.get('/student/:studentId', getEnrolledCourses);
enrollmentRouter.patch('/:id/pin', togglePin);
enrollmentRouter.delete('/:id', unenroll);

module.exports = enrollmentRouter;