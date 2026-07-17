const mongoose = require('mongoose');
const ValidationError = require('../exceptions/ValidationError');
const { MEDIA_PROVIDERS, ASSET_TYPES, ASSET_PURPOSES } = require('../constants/mediaTypes');
const mediaAssetRepository = require('../repositories/mediaAssetRepository');
const localStorageClient = require('../integrations/localStorageClient');
const cloudinaryClient = require('../integrations/cloudinaryClient');

const getProvider = () => {
  const provider = (process.env.MEDIA_PROVIDER || MEDIA_PROVIDERS.LOCAL).toLowerCase();
  if (provider === MEDIA_PROVIDERS.CLOUDINARY && cloudinaryClient.isConfigured()) {
    return MEDIA_PROVIDERS.CLOUDINARY;
  }
  return MEDIA_PROVIDERS.LOCAL;
};

const getBaseUrl = () => process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 9999}`;

const buildLocalContentUrl = (assetId) => `${getBaseUrl()}/api/v1/media/${assetId}/content`;

const toPublicAsset = (asset) => ({
  id: asset._id.toString(),
  ownerId: asset.ownerId.toString(),
  provider: asset.provider,
  url: asset.url,
  originalName: asset.originalName,
  mimeType: asset.mimeType,
  type: asset.type,
  sizeBytes: asset.sizeBytes,
  purpose: asset.purpose,
  isOrphan: asset.isOrphan,
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt
});

const assertPurposeMatchesType = (purpose, assetType) => {
  if (purpose === ASSET_PURPOSES.AVATAR && assetType !== ASSET_TYPES.IMAGE) {
    throw new ValidationError('Avatar uploads must be images');
  }
  if (purpose === ASSET_PURPOSES.CREDENTIAL && assetType !== ASSET_TYPES.PDF) {
    throw new ValidationError('Credential uploads must be PDF files');
  }
  if (purpose === ASSET_PURPOSES.THUMBNAIL && assetType !== ASSET_TYPES.IMAGE) {
    throw new ValidationError('Thumbnail uploads must be images');
  }
};

const getConfig = () => {
  const provider = getProvider();
  return {
    provider,
    limits: {
      image: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxBytes: 10 * 1024 * 1024
      },
      pdf: {
        mimeTypes: ['application/pdf'],
        maxBytes: 20 * 1024 * 1024
      }
    },
    purposes: Object.values(ASSET_PURPOSES),
    cloudinaryConfigured: cloudinaryClient.isConfigured()
  };
};

const uploadLocal = async ({ ownerId, file, purpose }) => {
  const validation = localStorageClient.validateMimeAndSize(file.mimetype, file.size);
  if (!validation.valid) throw new ValidationError(validation.message);
  assertPurposeMatchesType(purpose, validation.assetType);

  const storageKey = await localStorageClient.saveFile({
    ownerId,
    buffer: file.buffer,
    mimeType: file.mimetype
  });

  const assetId = new mongoose.Types.ObjectId();
  const url = buildLocalContentUrl(assetId);

  const asset = await mediaAssetRepository.create({
    _id: assetId,
    ownerId,
    provider: MEDIA_PROVIDERS.LOCAL,
    storageKey,
    url,
    originalName: file.originalname,
    mimeType: file.mimetype,
    type: validation.assetType,
    sizeBytes: file.size,
    purpose,
    isOrphan: true
  });

  return toPublicAsset(asset);
};

const createSignedUpload = async ({ ownerId, mimeType, sizeBytes, purpose }) => {
  if (getProvider() !== MEDIA_PROVIDERS.CLOUDINARY) {
    throw new ValidationError('Signed upload is only available when MEDIA_PROVIDER=cloudinary');
  }
  const validation = localStorageClient.validateMimeAndSize(mimeType, sizeBytes);
  if (!validation.valid) throw new ValidationError(validation.message);
  assertPurposeMatchesType(purpose, validation.assetType);

  const signed = cloudinaryClient.createSignedUploadParams({
    ownerId,
    assetType: validation.assetType,
    purpose
  });

  return {
    ...signed,
    mimeType,
    purpose,
    type: validation.assetType
  };
};

const confirmCloudinaryUpload = async ({
  ownerId,
  publicId,
  originalName,
  mimeType,
  sizeBytes,
  purpose
}) => {
  if (getProvider() !== MEDIA_PROVIDERS.CLOUDINARY) {
    throw new ValidationError('Cloudinary confirm is only available when MEDIA_PROVIDER=cloudinary');
  }
  const validation = localStorageClient.validateMimeAndSize(mimeType, sizeBytes);
  if (!validation.valid) throw new ValidationError(validation.message);
  assertPurposeMatchesType(purpose, validation.assetType);

  const url = cloudinaryClient.buildDeliveryUrl({
    publicId,
    assetType: validation.assetType
  });

  const asset = await mediaAssetRepository.create({
    ownerId,
    provider: MEDIA_PROVIDERS.CLOUDINARY,
    publicId,
    url,
    originalName,
    mimeType,
    type: validation.assetType,
    sizeBytes,
    purpose,
    isOrphan: true
  });

  return toPublicAsset(asset);
};

const getAssetById = async (assetId) => {
  const asset = await mediaAssetRepository.findById(assetId);
  if (!asset) throw new ValidationError('Media asset not found', [{ field: 'id', message: 'Not found' }]);
  return asset;
};

const canAccessAsset = (asset, user) => {
  if (!user) {
    return !asset.isOrphan && asset.type === ASSET_TYPES.IMAGE
      && [ASSET_PURPOSES.AVATAR, ASSET_PURPOSES.THUMBNAIL].includes(asset.purpose);
  }
  if (user.role === 'admin') return true;
  return asset.ownerId.toString() === user.id;
};

const getAssetMetadata = async ({ assetId, user }) => {
  const asset = await getAssetById(assetId);
  if (!canAccessAsset(asset, user)) {
    throw new ValidationError('You do not have permission to access this asset');
  }
  return toPublicAsset(asset);
};

const getAssetContent = async ({ assetId, user }) => {
  const asset = await getAssetById(assetId);
  if (!canAccessAsset(asset, user)) {
    throw new ValidationError('You do not have permission to access this asset');
  }
  if (asset.provider === MEDIA_PROVIDERS.CLOUDINARY) {
    return { redirectUrl: asset.url };
  }
  const buffer = await localStorageClient.readFile(asset.storageKey);
  return { buffer, mimeType: asset.mimeType, originalName: asset.originalName };
};

const deleteAsset = async ({ assetId, user }) => {
  const asset = await getAssetById(assetId);
  if (!canAccessAsset(asset, user)) {
    throw new ValidationError('You do not have permission to delete this asset');
  }
  if (!asset.isOrphan) {
    throw new ValidationError('Attached assets cannot be deleted. Replace them instead.');
  }
  if (asset.provider === MEDIA_PROVIDERS.LOCAL) {
    await localStorageClient.deleteFile(asset.storageKey);
  } else if (asset.provider === MEDIA_PROVIDERS.CLOUDINARY) {
    await cloudinaryClient.deleteAsset({ publicId: asset.publicId, assetType: asset.type });
  }
  await mediaAssetRepository.deleteById(assetId);
  return { deleted: true };
};

const verifyOwnedAssets = async ({ ownerId, assetIds, type, purpose, allowAttachedId = null }) => {
  if (!assetIds.length) return [];
  const assets = await mediaAssetRepository.findByIds(assetIds);
  if (assets.length !== assetIds.length) {
    throw new ValidationError('One or more media assets were not found');
  }
  for (const asset of assets) {
    if (asset.ownerId.toString() !== ownerId.toString()) {
      throw new ValidationError('You can only attach your own uploaded files');
    }
    if (asset.type !== type) {
      throw new ValidationError(`Asset ${asset._id} must be a ${type} file`);
    }
    const isCurrentAttachment = allowAttachedId && asset._id.toString() === allowAttachedId.toString();
    if (!asset.isOrphan && !isCurrentAttachment) {
      throw new ValidationError(`Asset ${asset._id} is already attached elsewhere`);
    }
    if (purpose && asset.purpose !== ASSET_PURPOSES.GENERAL && asset.purpose !== purpose) {
      throw new ValidationError(`Asset ${asset._id} was uploaded for a different purpose`);
    }
  }
  return assets;
};

const attachAsset = async ({ assetId, purpose }) => {
  return mediaAssetRepository.markAttached(assetId, purpose);
};

const detachAsset = async (assetId) => {
  return mediaAssetRepository.markOrphan(assetId);
};

module.exports = {
  getProvider,
  getConfig,
  uploadLocal,
  createSignedUpload,
  confirmCloudinaryUpload,
  getAssetMetadata,
  getAssetContent,
  deleteAsset,
  verifyOwnedAssets,
  attachAsset,
  detachAsset,
  toPublicAsset,
  buildLocalContentUrl
};
