const express = require('express');
const certificateRouter = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

// Get authenticated student's certificates list
certificateRouter.get('/my', authMiddleware, certificateController.getMyCertificates);

// Public verification check route (no auth needed)
certificateRouter.get('/verify/:code', certificateController.verifyCertificate);

// Admin management
certificateRouter.get('/', authMiddleware, roleGuard(ROLES.ADMIN), certificateController.listAllCertificates);
certificateRouter.post('/:id/revoke', authMiddleware, roleGuard(ROLES.ADMIN), certificateController.revokeCertificate);

module.exports = certificateRouter;
