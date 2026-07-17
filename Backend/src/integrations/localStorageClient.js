const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { MIME_LIMITS } = require('../constants/mediaTypes');

const DEFAULT_UPLOAD_DIR = path.join(__dirname, '../../uploads');

const getUploadDir = () => {
  const configured = process.env.UPLOAD_DIR;
  if (!configured) return DEFAULT_UPLOAD_DIR;
  return path.isAbsolute(configured) ? configured : path.join(__dirname, '../../', configured);
};

const sanitizeExtension = (mimeType) => {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf'
  };
  return map[mimeType] || '';
};

const resolveSafePath = (storageKey) => {
  const uploadDir = getUploadDir();
  const resolved = path.resolve(uploadDir, storageKey);
  const relative = path.relative(uploadDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid storage path');
  }
  return resolved;
};

const ensureUploadDir = async () => {
  await fs.mkdir(getUploadDir(), { recursive: true });
};

const saveFile = async ({ ownerId, buffer, mimeType }) => {
  await ensureUploadDir();
  const extension = sanitizeExtension(mimeType);
  const fileName = `${crypto.randomUUID()}${extension}`;
  const storageKey = path.join(String(ownerId), fileName);
  const absolutePath = resolveSafePath(storageKey);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);
  return storageKey.replace(/\\/g, '/');
};

const deleteFile = async (storageKey) => {
  if (!storageKey) return;
  try {
    const absolutePath = resolveSafePath(storageKey);
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const readFile = async (storageKey) => {
  const absolutePath = resolveSafePath(storageKey);
  return fs.readFile(absolutePath);
};

const detectAssetType = (mimeType) => {
  if (MIME_LIMITS.image.mimes.includes(mimeType)) return 'image';
  if (MIME_LIMITS.pdf.mimes.includes(mimeType)) return 'pdf';
  return null;
};

const validateMimeAndSize = (mimeType, sizeBytes) => {
  const assetType = detectAssetType(mimeType);
  if (!assetType) {
    return { valid: false, message: 'Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, PDF' };
  }
  const limits = MIME_LIMITS[assetType];
  if (sizeBytes > limits.maxBytes) {
    const maxMb = limits.maxBytes / (1024 * 1024);
    return { valid: false, message: `File exceeds maximum size of ${maxMb} MB` };
  }
  return { valid: true, assetType };
};

module.exports = {
  getUploadDir,
  saveFile,
  deleteFile,
  readFile,
  detectAssetType,
  validateMimeAndSize
};
