const TeacherApplication = require('../models/TeacherApplication');

const teacherApplicationRepository = {
  create(data) {
    return TeacherApplication.create(data);
  },

  findByUserId(userId) {
    return TeacherApplication.findOne({ userId })
      .populate('reviewedBy', 'fullName email');
  },

  findById(id) {
    return TeacherApplication.findById(id)
      .populate('userId', 'fullName email avatar bio role status')
      .populate('reviewedBy', 'fullName email');
  },

  list(filter, page, limit) {
    const skip = (page - 1) * limit;
    return Promise.all([
      TeacherApplication.find(filter)
        .populate('userId', 'fullName email avatar bio role status')
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TeacherApplication.countDocuments(filter)
    ]);
  },

  updateById(id, data) {
    return TeacherApplication.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    })
      .populate('userId', 'fullName email avatar bio role status')
      .populate('reviewedBy', 'fullName email');
  }
};

module.exports = teacherApplicationRepository;
