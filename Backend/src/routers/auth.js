const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validators/authValidator');
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', validate(authValidators.register), authController.register);
router.post('/verify-otp', validate(authValidators.verifyOtp), authController.verifyOtp);
router.post('/resend-otp', validate(authValidators.resendOtp), authController.resendOtp);
router.post('/login', validate(authValidators.login), authController.login);
router.post('/google', validate(authValidators.googleLogin), authController.googleLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(authValidators.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidators.resetPassword), authController.resetPassword);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
