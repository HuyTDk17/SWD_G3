const { verifyAccessToken } = require('../utils/generateToken');
const userRepository = require('../repositories/userRepository');
const { USER_STATUS } = require('../constants/userStatus');

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.optionalUser = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      const user = await userRepository.findById(decoded.id);
      if (user && user.status === USER_STATUS.ACTIVE) {
        req.optionalUser = {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          fullName: user.fullName
        };
      } else {
        req.optionalUser = null;
      }
    } catch (_error) {
      req.optionalUser = null;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = optionalAuthMiddleware;
