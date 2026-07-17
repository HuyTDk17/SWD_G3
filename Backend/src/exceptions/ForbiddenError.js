const AppError = require('./AppError');
const ERROR_CODES = require('../constants/errorCodes');

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = ERROR_CODES.FORBIDDEN) {
    super(message, 403, code);
  }
}

module.exports = ForbiddenError;
