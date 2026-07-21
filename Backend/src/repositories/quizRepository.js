const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');

const quizRepository = {
  createQuiz(data) {
    return Quiz.create(data);
  },

  findQuizById(id) {
    return Quiz.findById(id);
  },

  findQuizzesByCourseId(courseId, filter = {}) {
    return Quiz.find({ courseId, ...filter }).sort({ createdAt: -1 });
  },

  updateQuizById(id, data) {
    return Quiz.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  deleteQuizById(id) {
    return Quiz.findByIdAndDelete(id);
  },

  // Questions
  createQuestion(data) {
    return Question.create(data);
  },

  findQuestionsByQuizId(quizId) {
    return Question.find({ quizId }).sort({ order: 1 });
  },

  deleteQuestionsByQuizId(quizId) {
    return Question.deleteMany({ quizId });
  },

  deleteQuestionById(id) {
    return Question.findByIdAndDelete(id);
  },

  // Attempts
  createAttempt(data) {
    return QuizAttempt.create(data);
  },

  findAttemptById(id) {
    return QuizAttempt.findById(id);
  },

  countAttempts(studentId, quizId) {
    return QuizAttempt.countDocuments({ studentId, quizId, submittedAt: { $ne: null } });
  },

  updateAttemptById(id, data) {
    return QuizAttempt.findByIdAndUpdate(id, data, { new: true });
  }
};

module.exports = quizRepository;
