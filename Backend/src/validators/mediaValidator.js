const ValidationError = require('../exceptions/ValidationError');
const { ASSET_PURPOSES } = require('../constants/mediaTypes');

const mediaValidators = {
  upload(body) {
    const purpose = body.purpose || ASSET_PURPOSES.GENERAL;
    if (!Object.values(ASSET_PURPOSES).includes(purpose)) {
      throw new ValidationError('Invalid upload purpose');
    }
    return { purpose };
  },

  signedUpload(body) {
    const purpose = body.purpose || ASSET_PURPOSES.GENERAL;
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : '';
    const sizeBytes = Number(body.sizeBytes);
    if (!mimeType) throw new ValidationError('mimeType is required');
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      throw new ValidationError('sizeBytes must be a positive number');
    }
    if (!Object.values(ASSET_PURPOSES).includes(purpose)) {
      throw new ValidationError('Invalid upload purpose');
    }
    return { purpose, mimeType, sizeBytes };
  },

  confirm(body) {
    const purpose = body.purpose || ASSET_PURPOSES.GENERAL;
    const publicId = typeof body.publicId === 'string' ? body.publicId.trim() : '';
    const originalName = typeof body.originalName === 'string' ? body.originalName.trim() : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim() : '';
    const sizeBytes = Number(body.sizeBytes);
    if (!publicId) throw new ValidationError('publicId is required');
    if (!originalName) throw new ValidationError('originalName is required');
    if (!mimeType) throw new ValidationError('mimeType is required');
    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      throw new ValidationError('sizeBytes must be a positive number');
    }
    if (!Object.values(ASSET_PURPOSES).includes(purpose)) {
      throw new ValidationError('Invalid upload purpose');
    }
    return { purpose, publicId, originalName, mimeType, sizeBytes };
  }
};

module.exports = mediaValidators;
