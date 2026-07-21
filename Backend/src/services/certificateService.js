const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const notificationService = require('./notificationService');
const courseRepository = require('../repositories/courseRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const ERROR_CODES = require('../constants/errorCodes');

const certificateService = {
  async checkAndIssue(userId, courseId) {
    try {
      const progress = await Progress.findOne({ studentId: userId, courseId });
      if (!progress || progress.completionPercent < 100) {
        return null; // Not complete
      }

      // Check if all published quizzes are passed (Step 10 integration)
      const publishedQuizzes = await Quiz.find({ courseId, status: 'published' });
      if (publishedQuizzes.length > 0) {
        const passedQuizzes = await QuizAttempt.distinct('quizId', {
          studentId: userId,
          isPassed: true,
          quizId: { $in: publishedQuizzes.map(q => q._id) }
        });

        if (passedQuizzes.length < publishedQuizzes.length) {
          return null; // Quizzes are pending/failed
        }
      }

      // Check existing certificate
      const existing = await Certificate.findOne({ studentId: userId, courseId });
      if (existing) {
        return existing;
      }

      // Generate verification code
      const rand1 = Math.random().toString(36).substr(2, 4).toUpperCase();
      const rand2 = Math.random().toString(36).substr(2, 4).toUpperCase();
      const verificationCode = `CERT-${rand1}-${rand2}`;

      const certificate = await Certificate.create({
        studentId: userId,
        courseId,
        verificationCode
      });

      // Send alert
      const course = await courseRepository.findById(courseId);
      const courseTitle = course ? course.title : 'Course';
      await notificationService.createNotification(
        userId,
        'Certificate Earned! 🎉',
        `Congratulations! You have completed all lessons and assessments in "${courseTitle}" and earned your Certificate.`,
        'system'
      );

      return certificate;
    } catch (error) {
      console.error('Error during certificate auto-issue check:', error);
    }
  },

  async getMyCertificates(userId) {
    return Certificate.find({ studentId: userId }).populate('courseId');
  },

  async verifyCertificate(verificationCode) {
    const cert = await Certificate.findOne({ verificationCode })
      .populate({
        path: 'studentId',
        select: 'name email fullName'
      })
      .populate({
        path: 'courseId',
        select: 'title language cefrLevel durationDays'
      });

    if (!cert) {
      throw new NotFoundError('Certificate not found or verification code is invalid.', ERROR_CODES.NOT_FOUND);
    }

    return cert;
  }
};

module.exports = certificateService;
