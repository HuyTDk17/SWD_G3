const AppError = require('./AppError');
const ERROR_CODES = require('../constants/errorCodes');

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null, code = ERROR_CODES.VALIDATION_ERROR) {
    super(message, 400, code, details);
  }
}

module.exports = ValidationError;
