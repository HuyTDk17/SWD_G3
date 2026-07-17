const multer = require('multer');
const ValidationError = require('../exceptions/ValidationError');
const { MIME_LIMITS } = require('../constants/mediaTypes');

const allowedMimes = [...MIME_LIMITS.image.mimes, ...MIME_LIMITS.pdf.mimes];
const maxFileSize = Math.max(MIME_LIMITS.image.maxBytes, MIME_LIMITS.pdf.maxBytes);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return callback(new ValidationError('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, PDF'));
    }
    return callback(null, true);
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      if (!req.file) {
        return next(new ValidationError('File is required'));
      }
      return next();
    }
    if (error instanceof ValidationError) return next(error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ValidationError('File exceeds the maximum allowed size'));
    }
    return next(error);
  });
};

module.exports = {
  handleUpload
};
