const MEDIA_PROVIDERS = {
  LOCAL: 'local',
  CLOUDINARY: 'cloudinary'
};

const ASSET_TYPES = {
  IMAGE: 'image',
  PDF: 'pdf'
};

const ASSET_PURPOSES = {
  AVATAR: 'avatar',
  CREDENTIAL: 'credential',
  THUMBNAIL: 'thumbnail',
  GENERAL: 'general'
};

const MIME_LIMITS = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxBytes: 10 * 1024 * 1024
  },
  pdf: {
    mimes: ['application/pdf'],
    maxBytes: 20 * 1024 * 1024
  }
};

module.exports = {
  MEDIA_PROVIDERS,
  ASSET_TYPES,
  ASSET_PURPOSES,
  MIME_LIMITS
};
