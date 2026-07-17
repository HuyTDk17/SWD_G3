const { verifyAccessToken } = require('../utils/generateToken');
const UnauthorizedError = require('../exceptions/UnauthorizedError');
const ERROR_CODES = require('../constants/errorCodes');
const userRepository = require('../repositories/userRepository');
const { USER_STATUS } = require('../constants/userStatus');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required', ERROR_CODES.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token expired', ERROR_CODES.ACCESS_TOKEN_EXPIRED);
      }
      throw new UnauthorizedError('Invalid access token', ERROR_CODES.UNAUTHORIZED);
    }

    const user = await userRepository.findById(decoded.id);
    if (!user || user.status !== USER_STATUS.ACTIVE) {
      throw new UnauthorizedError('Invalid access token', ERROR_CODES.UNAUTHORIZED);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
