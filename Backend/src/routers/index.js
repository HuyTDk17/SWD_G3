const express = require('express');
const router = express.Router();


const courseRouter = require('./course');
const enrollmentRouter = require('./enrollment');
const authRouter = require('./auth');
const userRouter = require('./users');
const mediaRouter = require('./media');

router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', userRouter);
router.use('/api/v1/media', mediaRouter);
router.use('/course', courseRouter);
router.use('/enrollments', enrollmentRouter);

module.exports = router;