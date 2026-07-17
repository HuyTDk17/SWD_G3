const AppError = require('./AppError');
const ERROR_CODES = require('../constants/errorCodes');

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = ERROR_CODES.UNAUTHORIZED) {
    super(message, 401, code);
  }
}

module.exports = UnauthorizedError;
