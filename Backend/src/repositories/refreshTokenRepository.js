const RefreshToken = require('../models/RefreshToken');

const refreshTokenRepository = {
  create(data) {
    return RefreshToken.create(data);
  },

  findByTokenHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash, isRevoked: false });
  },

  revokeByTokenHash(tokenHash) {
    return RefreshToken.findOneAndUpdate(
      { tokenHash },
      { isRevoked: true },
      { new: true }
    );
  },

  revokeAllForUser(userId) {
    return RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }
};

module.exports = refreshTokenRepository;
