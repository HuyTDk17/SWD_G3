const AppError = require('./AppError');
const ERROR_CODES = require('../constants/errorCodes');

class NotFoundError extends AppError {
  constructor(message = 'Not found', code = ERROR_CODES.NOT_FOUND) {
    super(message, 404, code);
  }
}

module.exports = NotFoundError;
