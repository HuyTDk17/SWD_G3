const Progress = require('../models/Progress');
const LessonProgress = require('../models/LessonProgress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const progressController = {
  async getProgressDetails(req, res, next) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;

      const progress = await Progress.findOne({ studentId, courseId });
      if (!progress) {
        return res.status(404).json({ success: false, message: 'Progress record not found for this enrollment.' });
      }

      // Fetch lesson completions
      const lessonProgressList = await LessonProgress.find({ progressId: progress._id })
        .populate({
          path: 'lessonId',
          select: 'title description order estimatedMinutes status'
        });

      // Fetch quiz completion stats
      const quizzes = await Quiz.find({ courseId, status: 'published' });
      const quizProgress = [];

      for (const quiz of quizzes) {
        const attempts = await QuizAttempt.find({ studentId, quizId: quiz._id }).sort({ score: -1 });
        const bestAttempt = attempts[0] || null;
        quizProgress.push({
          quizId: quiz._id,
          title: quiz.title,
          attemptsCount: attempts.length,
          bestScore: bestAttempt ? bestAttempt.score : null,
          isPassed: bestAttempt ? bestAttempt.isPassed : false,
          passingScore: quiz.passingScore
        });
      }

      res.json({
        success: true,
        data: {
          progress,
          lessonProgress: lessonProgressList.sort((a, b) => (a.lessonId?.order || 0) - (b.lessonId?.order || 0)),
          quizProgress
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = progressController;
