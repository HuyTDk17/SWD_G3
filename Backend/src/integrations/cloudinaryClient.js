const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');
const { ASSET_TYPES } = require('../constants/mediaTypes');

const getConfig = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: process.env.CLOUDINARY_FOLDER || 'learning-online'
});

const isConfigured = () => {
  const { cloudName, apiKey, apiSecret } = getConfig();
  return Boolean(cloudName && apiKey && apiSecret);
};

const configure = () => {
  const { cloudName, apiKey, apiSecret } = getConfig();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
};

const buildResourceType = (assetType) => (assetType === ASSET_TYPES.PDF ? 'raw' : 'image');

const createSignedUploadParams = ({ ownerId, assetType, purpose }) => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured');
  }
  configure();
  const { folder } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const resourceType = buildResourceType(assetType);
  const publicId = `${folder}/${ownerId}/${purpose}-${timestamp}-${crypto.randomBytes(6).toString('hex')}`;
  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, getConfig().apiSecret);
  return {
    cloudName: getConfig().cloudName,
    apiKey: getConfig().apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${getConfig().cloudName}/${resourceType}/upload`
  };
};

const buildDeliveryUrl = ({ publicId, assetType }) => {
  configure();
  const resourceType = buildResourceType(assetType);
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true
  });
};

const deleteAsset = async ({ publicId, assetType }) => {
  if (!isConfigured()) return;
  configure();
  const resourceType = buildResourceType(assetType);
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  isConfigured,
  createSignedUploadParams,
  buildDeliveryUrl,
  deleteAsset
};
