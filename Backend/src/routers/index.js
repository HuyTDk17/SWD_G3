const express = require('express');
const router = express.Router();


const courseRouter = require('./course');
const enrollmentRouter = require('./enrollment');
const authRouter = require('./auth');
const userRouter = require('./users');
const mediaRouter = require('./media');
const reviewRouter = require('./review');
const certificateRouter = require('./certificate');
const notificationRouter = require('./notification');
const aiRouter = require('./ai');
const dashboardRouter = require('./dashboard');
const adminRouter = require('./admin');
const configRouter = require('./config');

router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', userRouter);
router.use('/api/v1/media', mediaRouter);
router.use('/api/v1/courses', courseRouter);
router.use('/api/v1/enrollments', enrollmentRouter);
router.use('/api/v1/reviews', reviewRouter);
router.use('/api/v1/certificates', certificateRouter);
router.use('/api/v1/notifications', notificationRouter);
router.use('/api/v1/ai', aiRouter);
router.use('/api/v1/dashboard', dashboardRouter);
router.use('/api/v1/admin', adminRouter);
router.use('/api/v1/config', configRouter);

module.exports = router;