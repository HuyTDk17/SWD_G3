const express = require('express');
const enrollmentRouter = express.Router();
const { enroll, getAllEnrollments, getMyEnrollments, getEnrolledCourses, togglePin, unenroll, joinWaitlist, leaveWaitlist, getMyWaitlist } = require('../controllers/enrollment');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all enrollments (Admin check can be added, but keep accessible as needed)
enrollmentRouter.get('/', getAllEnrollments);

// Student actions
enrollmentRouter.post('/enroll', authMiddleware, enroll);
enrollmentRouter.get('/my', authMiddleware, getMyEnrollments);

// Waitlist
enrollmentRouter.post('/waitlist', authMiddleware, joinWaitlist);
enrollmentRouter.get('/waitlist/my', authMiddleware, getMyWaitlist);
enrollmentRouter.delete('/waitlist/:id', authMiddleware, leaveWaitlist);

// Backward compatibility/direct studentId requests
enrollmentRouter.get('/student/:studentId', getEnrolledCourses);

// Pinning & Unenrollment
enrollmentRouter.patch('/:id/pin', authMiddleware, togglePin);
enrollmentRouter.delete('/:id', authMiddleware, unenroll);

module.exports = enrollmentRouter;