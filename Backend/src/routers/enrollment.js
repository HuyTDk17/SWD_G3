const express = require('express');
const enrollmentRouter = express.Router();
const { enroll, getAllEnrollments, getMyEnrollments, getEnrolledCourses, togglePin, unenroll } = require('../controllers/enrollment');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all enrollments (Admin check can be added, but keep accessible as needed)
enrollmentRouter.get('/', getAllEnrollments);

// Student actions
enrollmentRouter.post('/enroll', authMiddleware, enroll);
enrollmentRouter.get('/my', authMiddleware, getMyEnrollments);

// Backward compatibility/direct studentId requests
enrollmentRouter.get('/student/:studentId', getEnrolledCourses);

// Pinning & Unenrollment
enrollmentRouter.patch('/:id/pin', authMiddleware, togglePin);
enrollmentRouter.delete('/:id', authMiddleware, unenroll);

module.exports = enrollmentRouter;