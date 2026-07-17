const ValidationError = require('../exceptions/ValidationError');
const { ROLE_LIST } = require('../constants/roles');
const { USER_STATUS_LIST } = require('../constants/userStatus');

const optionalString = (value, maxLength) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return null;
  return value.trim().slice(0, maxLength);
};

const userValidators = {
  updateProfile(body) {
    const allowed = {};
    const errors = [];

    if (body.fullName !== undefined) {
      const fullName = optionalString(body.fullName, 100);
      if (!fullName || fullName.length < 2) {
        errors.push({ field: 'fullName', message: 'Full name must contain at least 2 characters' });
      } else {
        allowed.fullName = fullName;
      }
    }

    for (const [field, maxLength] of [['bio', 500], ['avatar', 500], ['nativeLanguage', 50], ['timezone', 100]]) {
      if (body[field] !== undefined) {
        const value = optionalString(body[field], maxLength);
        if (value === null) {
          errors.push({ field, message: `${field} must be a string` });
        } else {
          allowed[field] = value || null;
        }
      }
    }

    if (body.targetLanguages !== undefined) {
      if (!Array.isArray(body.targetLanguages) || body.targetLanguages.some((item) => typeof item !== 'string')) {
        errors.push({ field: 'targetLanguages', message: 'Target languages must be an array of strings' });
      } else {
        allowed.targetLanguages = [...new Set(body.targetLanguages.map((item) => item.trim()).filter(Boolean))].slice(0, 10);
      }
    }

    if (errors.length) throw new ValidationError('Validation failed', errors);
    if (!Object.keys(allowed).length) {
      throw new ValidationError('No valid profile fields provided');
    }
    return allowed;
  },

  teacherApplication(body) {
    const errors = [];
    const credentials = optionalString(body.credentials, 2000);
    const languagesTaught = Array.isArray(body.languagesTaught)
      ? [...new Set(body.languagesTaught.map((item) => typeof item === 'string' ? item.trim() : '').filter(Boolean))]
      : [];
    const documentAssetIds = Array.isArray(body.documentAssetIds)
      ? body.documentAssetIds.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()).slice(0, 10)
      : [];
    const documentUrls = Array.isArray(body.documentUrls)
      ? body.documentUrls.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()).slice(0, 10)
      : [];

    if (!credentials || credentials.length < 20) {
      errors.push({ field: 'credentials', message: 'Credentials must contain at least 20 characters' });
    }
    if (!languagesTaught.length) {
      errors.push({ field: 'languagesTaught', message: 'Select at least one teaching language' });
    }
    if (body.documentAssetIds !== undefined && !Array.isArray(body.documentAssetIds)) {
      errors.push({ field: 'documentAssetIds', message: 'Document asset IDs must be an array' });
    }
    if (body.documentUrls !== undefined && !Array.isArray(body.documentUrls)) {
      errors.push({ field: 'documentUrls', message: 'Document URLs must be an array' });
    }
    if (documentUrls.length) {
      errors.push({ field: 'documentUrls', message: 'Client-provided document URLs are not accepted. Upload PDF files instead.' });
    }

    if (errors.length) throw new ValidationError('Validation failed', errors);
    return { credentials, languagesTaught, documentAssetIds };
  },

  setAvatar(body) {
    const assetId = typeof body.assetId === 'string' ? body.assetId.trim() : '';
    if (!assetId) {
      throw new ValidationError('assetId is required');
    }
    return { assetId };
  },

  reviewApplication(body) {
    const decision = body.decision;
    const adminFeedback = optionalString(body.adminFeedback, 1000) || '';
    if (!['approved', 'rejected'].includes(decision)) {
      throw new ValidationError('Decision must be approved or rejected');
    }
    if (decision === 'rejected' && !adminFeedback) {
      throw new ValidationError('Admin feedback is required when rejecting an application');
    }
    return { decision, adminFeedback };
  },

  updateStatus(body) {
    if (!USER_STATUS_LIST.includes(body.status)) {
      throw new ValidationError(`Status must be one of: ${USER_STATUS_LIST.join(', ')}`);
    }
    return { status: body.status };
  },

  updateRole(body) {
    if (!ROLE_LIST.includes(body.role)) {
      throw new ValidationError(`Role must be one of: ${ROLE_LIST.join(', ')}`);
    }
    return { role: body.role };
  }
};

module.exports = userValidators;
