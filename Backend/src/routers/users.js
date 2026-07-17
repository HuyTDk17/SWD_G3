const express = require('express');
const userController = require('../controllers/userController');
const userValidators = require('../validators/userValidator');
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const roleGuard = require('../middlewares/roleGuard');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', userController.getMe);
router.patch('/me', validate(userValidators.updateProfile), userController.updateMe);
router.patch('/me/avatar', validate(userValidators.setAvatar), userController.setAvatar);

router.post(
  '/teacher-application',
  roleGuard(ROLES.STUDENT),
  validate(userValidators.teacherApplication),
  userController.submitTeacherApplication
);
router.get(
  '/teacher-application',
  roleGuard(ROLES.STUDENT),
  userController.getMyTeacherApplication
);

router.get(
  '/teacher-applications',
  roleGuard(ROLES.ADMIN),
  userController.listTeacherApplications
);
router.patch(
  '/teacher-applications/:id/review',
  roleGuard(ROLES.ADMIN),
  validate(userValidators.reviewApplication),
  userController.reviewTeacherApplication
);

router.get('/', roleGuard(ROLES.ADMIN), userController.listUsers);
router.patch(
  '/:id/status',
  roleGuard(ROLES.ADMIN),
  validate(userValidators.updateStatus),
  userController.updateUserStatus
);
router.patch(
  '/:id/role',
  roleGuard(ROLES.ADMIN),
  validate(userValidators.updateRole),
  userController.updateUserRole
);

module.exports = router;
