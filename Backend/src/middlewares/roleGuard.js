const ForbiddenError = require('../exceptions/ForbiddenError');
const ERROR_CODES = require('../constants/errorCodes');

const roleGuard = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError('Forbidden', ERROR_CODES.FORBIDDEN));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ForbiddenError('Insufficient permissions', ERROR_CODES.FORBIDDEN));
  }

  next();
};

module.exports = roleGuard;
