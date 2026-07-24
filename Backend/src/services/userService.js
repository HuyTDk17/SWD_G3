const userRepository = require('../repositories/userRepository');
const teacherApplicationRepository = require('../repositories/teacherApplicationRepository');
const mediaService = require('./mediaService');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { ROLES } = require('../constants/roles');
const { ASSET_TYPES, ASSET_PURPOSES } = require('../constants/mediaTypes');
const ERROR_CODES = require('../constants/errorCodes');
const { APPLICATION_STATUS } = require('../models/TeacherApplication');
const ValidationError = require('../exceptions/ValidationError');
const ForbiddenError = require('../exceptions/ForbiddenError');
const NotFoundError = require('../exceptions/NotFoundError');
const ConflictError = require('../exceptions/ConflictError');

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  avatar: user.avatar,
  avatarAssetId: user.avatarAssetId || null,
  bio: user.bio,
  targetLanguages: user.targetLanguages,
  nativeLanguage: user.nativeLanguage,
  timezone: user.timezone,
  isEmailVerified: user.isEmailVerified,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const normalizePagination = ({ page = 1, limit = 20 }) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 20))
});

const userService = {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    return sanitizeUser(user);
  },

  async updateProfile(userId, data) {
    const user = await userRepository.updateById(userId, data);
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    return sanitizeUser(user);
  },

  async setAvatar(userId, assetId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);

    await mediaService.verifyOwnedAssets({
      ownerId: userId,
      assetIds: [assetId],
      type: ASSET_TYPES.IMAGE,
      purpose: ASSET_PURPOSES.AVATAR,
      allowAttachedId: user.avatarAssetId
    });

    if (user.avatarAssetId && user.avatarAssetId.toString() !== assetId.toString()) {
      await mediaService.detachAsset(user.avatarAssetId);
    }

    const asset = await mediaService.attachAsset({
      assetId,
      purpose: ASSET_PURPOSES.AVATAR
    });

    const updated = await userRepository.updateById(userId, {
      avatarAssetId: asset._id,
      avatar: asset.url
    });
    return sanitizeUser(updated);
  },

  async submitTeacherApplication(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    if (user.role !== ROLES.STUDENT) {
      throw new ForbiddenError('Only students can apply to become a teacher');
    }

    if (!user.fullName || !user.bio || (!user.avatar && !user.avatarAssetId)) {
      throw new ValidationError(
        'Complete your full name, bio and avatar before applying',
        null,
        ERROR_CODES.PROFILE_INCOMPLETE
      );
    }

    const { documentAssetIds = [], ...applicationData } = data;
    if (documentAssetIds.length) {
      await mediaService.verifyOwnedAssets({
        ownerId: userId,
        assetIds: documentAssetIds,
        type: ASSET_TYPES.PDF,
        purpose: ASSET_PURPOSES.CREDENTIAL
      });
      for (const assetId of documentAssetIds) {
        await mediaService.attachAsset({ assetId, purpose: ASSET_PURPOSES.CREDENTIAL });
      }
    }

    const existing = await teacherApplicationRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError(
        'A teacher application already exists for this account',
        ERROR_CODES.APPLICATION_ALREADY_EXISTS
      );
    }

    return teacherApplicationRepository.create({
      userId,
      ...applicationData,
      documentAssetIds,
      documentUrls: []
    });
  },

  async getMyTeacherApplication(userId) {
    return teacherApplicationRepository.findByUserId(userId);
  },

  async listTeacherApplications(query) {
    const { page, limit } = normalizePagination(query);
    const filter = {};
    if (query.status) {
      if (!Object.values(APPLICATION_STATUS).includes(query.status)) {
        throw new ValidationError('Invalid application status', null, ERROR_CODES.INVALID_APPLICATION_STATUS);
      }
      filter.status = query.status;
    }

    const [items, total] = await teacherApplicationRepository.list(filter, page, limit);
    return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  async reviewTeacherApplication(applicationId, adminId, { decision, adminFeedback }) {
    const application = await teacherApplicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Teacher application not found', ERROR_CODES.APPLICATION_NOT_FOUND);
    }
    if (application.status !== APPLICATION_STATUS.PENDING) {
      throw new ConflictError('This application has already been reviewed');
    }

    const updated = await teacherApplicationRepository.updateById(applicationId, {
      status: decision,
      adminFeedback,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    if (decision === APPLICATION_STATUS.APPROVED) {
      await userRepository.updateById(application.userId._id, { role: ROLES.TEACHER });
    }

    // Send application notification (Step 11 integration)
    const notificationService = require('./notificationService');
    const title = decision === APPLICATION_STATUS.APPROVED ? 'Teacher Application Approved! 🎉' : 'Teacher Application Update';
    const message = decision === APPLICATION_STATUS.APPROVED 
      ? 'Congratulations! Your teacher application has been approved. You are now a Teacher in the platform.'
      : `Your teacher application was reviewed. Feedback: ${adminFeedback || 'None'}`;
    await notificationService.createNotification(application.userId._id, title, message, 'application');

    return updated;
  },

  async listUsers(query) {
    const { page, limit } = normalizePagination(query);
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    const [items, total] = await userRepository.list(filter, page, limit);
    return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  async updateUserStatus(actorId, userId, status) {
    if (actorId === userId) {
      throw new ForbiddenError('You cannot change your own account status', ERROR_CODES.CANNOT_MODERATE_SELF);
    }
    const user = await userRepository.updateById(userId, { status });
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    return sanitizeUser(user);
  },

  async updateUserRole(actorId, userId, role) {
    if (actorId === userId) {
      throw new ForbiddenError('You cannot change your own role', ERROR_CODES.CANNOT_MODERATE_SELF);
    }
    const user = await userRepository.updateById(userId, { role });
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);
    return sanitizeUser(user);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found', ERROR_CODES.USER_NOT_FOUND);

    if (!user.passwordHash) {
      throw new ValidationError(
        'This account signed up with Google and has no password set yet',
        null,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ValidationError('Current password is incorrect', [
        { field: 'currentPassword', message: 'Current password is incorrect' }
      ]);
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.updateById(userId, { passwordHash: newHash });
    return { message: 'Password changed successfully' };
  }
};

module.exports = userService;
