const AppError = require('./AppError');
const ERROR_CODES = require('../constants/errorCodes');

class ConflictError extends AppError {
  constructor(message = 'Conflict', code = ERROR_CODES.VALIDATION_ERROR) {
    super(message, 409, code);
  }
}

module.exports = ConflictError;
