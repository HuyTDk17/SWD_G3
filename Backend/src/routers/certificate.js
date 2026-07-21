const express = require('express');
const certificateRouter = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middlewares/authMiddleware');

// Get authenticated student's certificates list
certificateRouter.get('/my', authMiddleware, certificateController.getMyCertificates);

// Public verification check route (no auth needed)
certificateRouter.get('/verify/:code', certificateController.verifyCertificate);

module.exports = certificateRouter;
