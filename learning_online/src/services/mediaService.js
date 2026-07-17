import mediaApi from '../api/mediaApi';
import authService from './authService';

const unwrap = (response) => response.data.data;

let configCache = null;

const mediaService = {
  async getConfig(force = false) {
    if (!configCache || force) {
      configCache = unwrap(await mediaApi.getConfig());
    }
    return configCache;
  },

  async uploadLocal({ file, purpose }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    return unwrap(await mediaApi.upload(formData));
  },

  async uploadCloudinary({ file, purpose, onProgress }) {
    await this.getConfig();
    const signed = unwrap(await mediaApi.signedUpload({
      mimeType: file.type,
      sizeBytes: file.size,
      purpose
    }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signed.apiKey);
    formData.append('timestamp', String(signed.timestamp));
    formData.append('signature', signed.signature);
    formData.append('folder', signed.folder);
    formData.append('public_id', signed.publicId);

    const response = await fetch(signed.uploadUrl, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }
    if (onProgress) onProgress(100);

    const cloudinaryResult = await response.json();
    return unwrap(await mediaApi.confirm({
      publicId: cloudinaryResult.public_id,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      purpose
    }));
  },

  async upload({ file, purpose, onProgress }) {
    const config = await this.getConfig();
    if (config.provider === 'cloudinary') {
      return this.uploadCloudinary({ file, purpose, onProgress });
    }
    if (onProgress) onProgress(50);
    const asset = await this.uploadLocal({ file, purpose });
    if (onProgress) onProgress(100);
    return asset;
  },

  async remove(assetId) {
    return unwrap(await mediaApi.delete(assetId));
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  getErrorMessage: authService.getErrorMessage
};

export default mediaService;
