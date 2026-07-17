const User = require('../models/User');

const userRepository = {
  create(data) {
    return User.create(data);
  },

  findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() });
  },

  findById(id) {
    return User.findById(id);
  },

  updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  list(filter, page, limit) {
    const skip = (page - 1) * limit;
    return Promise.all([
      User.find(filter)
        .select('-passwordHash -failedLoginCount -lockUntil')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);
  }
};

module.exports = userRepository;
