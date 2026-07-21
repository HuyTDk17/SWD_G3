const Lesson = require('../models/Lesson');

const lessonRepository = {
  create(data) {
    return Lesson.create(data);
  },

  findById(id) {
    return Lesson.findById(id).populate('videoAssetId').populate('audioAssetId').populate('resourceAssetIds');
  },

  findByCourseId(courseId, filter = {}) {
    const query = { courseId, ...filter };
    return Lesson.find(query).sort({ order: 1 });
  },

  updateById(id, data) {
    return Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  deleteById(id) {
    return Lesson.findByIdAndDelete(id);
  },

  async getMaxOrder(courseId) {
    const lastLesson = await Lesson.findOne({ courseId }).sort({ order: -1 }).select('order');
    return lastLesson ? lastLesson.order : 0;
  },

  async countLessonsByCourseId(courseId, filter = {}) {
    return Lesson.countDocuments({ courseId, ...filter });
  },

  async updateOrders(lessonOrderPairs) {
    const bulkOps = lessonOrderPairs.map((pair) => ({
      updateOne: {
        filter: { _id: pair.id },
        update: { order: pair.order }
      }
    }));
    return Lesson.bulkWrite(bulkOps);
  }
};

module.exports = lessonRepository;
