const Progress = require('../models/Progress');
const LessonProgress = require('../models/LessonProgress');
const Lesson = require('../models/Lesson');

const progressRepository = {
  findByEnrollmentId(enrollmentId) {
    return Progress.findOne({ enrollmentId });
  },

  findByStudentAndCourse(studentId, courseId) {
    return Progress.findOne({ studentId, courseId });
  },

  createProgress(data) {
    return Progress.create(data);
  },

  updateProgressById(id, data) {
    return Progress.findByIdAndUpdate(id, data, { new: true });
  },

  async findOrCreateProgress(studentId, courseId, enrollmentId) {
    let progress = await Progress.findOne({ enrollmentId });
    if (!progress) {
      // Find published lessons to initialize count
      const totalLessons = await Lesson.countDocuments({ courseId, status: 'published' });
      progress = await Progress.create({
        studentId,
        courseId,
        enrollmentId,
        totalLessons,
        completionPercent: 0,
        lessonsCompleted: 0
      });
    }
    return progress;
  },

  getLessonProgress(progressId, lessonId) {
    return LessonProgress.findOne({ progressId, lessonId });
  },

  async createLessonProgress(data) {
    return LessonProgress.create(data);
  },

  async getLessonsProgressByProgressId(progressId) {
    return LessonProgress.find({ progressId });
  },

  async countCompletedLessons(progressId) {
    return LessonProgress.countDocuments({ progressId, isCompleted: true });
  },

  async markLessonCompleted(progressId, lessonId) {
    const updated = await LessonProgress.findOneAndUpdate(
      { progressId, lessonId },
      { isCompleted: true, completedAt: Date.now() },
      { new: true, upsert: true }
    );
    return updated;
  }
};

module.exports = progressRepository;
