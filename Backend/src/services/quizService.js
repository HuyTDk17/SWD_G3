const quizRepository = require('../repositories/quizRepository');
const courseRepository = require('../repositories/courseRepository');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const ERROR_CODES = require('../constants/errorCodes');
const ValidationError = require('../exceptions/ValidationError');
const ForbiddenError = require('../exceptions/ForbiddenError');
const NotFoundError = require('../exceptions/NotFoundError');

const quizService = {
  async createQuiz(teacherId, role, courseId, data) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    if (course.teacherId._id.toString() !== teacherId && role !== 'admin') {
      throw new ForbiddenError('No permission to add quizzes to this course', ERROR_CODES.FORBIDDEN);
    }

    const { questions = [], ...quizData } = data;
    quizData.courseId = courseId;
    quizData.teacherId = teacherId;

    const quiz = await quizRepository.createQuiz(quizData);

    // Save questions
    if (questions.length > 0) {
      for (const [index, q] of questions.entries()) {
        await quizRepository.createQuestion({
          ...q,
          quizId: quiz._id,
          order: index + 1
        });
      }
    }

    return quiz;
  },

  async updateQuiz(userId, role, courseId, id, data) {
    const quiz = await quizRepository.findQuizById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found', ERROR_CODES.NOT_FOUND);
    }

    if (quiz.teacherId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('No permission to update this quiz', ERROR_CODES.FORBIDDEN);
    }

    const { questions, ...quizData } = data;
    const updatedQuiz = await quizRepository.updateQuizById(id, quizData);

    if (questions) {
      // Clear old questions and bulk insert new
      await quizRepository.deleteQuestionsByQuizId(id);
      for (const [index, q] of questions.entries()) {
        await quizRepository.createQuestion({
          ...q,
          quizId: id,
          order: index + 1
        });
      }
    }

    return updatedQuiz;
  },

  async deleteQuiz(userId, role, courseId, id) {
    const quiz = await quizRepository.findQuizById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found', ERROR_CODES.NOT_FOUND);
    }

    if (quiz.teacherId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('No permission to delete this quiz', ERROR_CODES.FORBIDDEN);
    }

    await quizRepository.deleteQuestionsByQuizId(id);
    await quizRepository.deleteQuizById(id);
    return { message: 'Quiz deleted successfully' };
  },

  async getQuizzes(courseId, userId = null, role = null) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    const isTeacher = userId && course.teacherId._id.toString() === userId.toString();
    const isAdmin = role === 'admin';

    let filter = {};
    if (!isTeacher && !isAdmin) {
      // General students and guests see only published quizzes
      filter.status = 'published';
    }

    return quizRepository.findQuizzesByCourseId(courseId, filter);
  },

  async getQuizById(courseId, id, userId = null, role = null) {
    const quiz = await quizRepository.findQuizById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found', ERROR_CODES.NOT_FOUND);
    }

    const isTeacher = userId && quiz.teacherId.toString() === userId.toString();
    const isAdmin = role === 'admin';

    if (quiz.status === 'draft' && !isTeacher && !isAdmin) {
      throw new ForbiddenError('No permission to view this draft quiz', ERROR_CODES.FORBIDDEN);
    }

    const questions = await quizRepository.findQuestionsByQuizId(id);

    // Strip answers and explanations for security (anti-cheating) if student/guest
    let filteredQuestions = questions;
    if (!isTeacher && !isAdmin) {
      filteredQuestions = questions.map(q => {
        const obj = q.toObject();
        delete obj.correctAnswer;
        delete obj.explanation;
        return obj;
      });
    }

    return {
      ...quiz.toObject(),
      questions: filteredQuestions
    };
  },

  async startAttempt(userId, courseId, id) {
    const quiz = await quizRepository.findQuizById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found', ERROR_CODES.NOT_FOUND);
    }

    if (quiz.status !== 'published') {
      throw new ForbiddenError('This quiz is not published yet', ERROR_CODES.FORBIDDEN);
    }

    // BR-QUIZ-001: Enrolled to Attempt
    const enrollment = await Enrollment.findOne({ studentId: userId, courseId });
    if (!enrollment) {
      throw new ForbiddenError('You must enroll in this course to take this quiz', ERROR_CODES.FORBIDDEN);
    }

    // BR-QUIZ-002: Max Attempts Check
    const attemptCount = await quizRepository.countAttempts(userId, id);
    if (attemptCount >= quiz.maxAttempts) {
      throw new ValidationError(`You have reached the maximum attempt limit of ${quiz.maxAttempts} for this quiz`, [
        { field: 'maxAttempts', message: 'Maximum attempts reached' }
      ]);
    }

    // Create QuizAttempt
    const attempt = await quizRepository.createAttempt({
      quizId: id,
      studentId: userId,
      startedAt: Date.now()
    });

    const questions = await quizRepository.findQuestionsByQuizId(id);

    // Strip correct answers
    const filteredQuestions = questions.map(q => {
      const obj = q.toObject();
      delete obj.correctAnswer;
      delete obj.explanation;
      return obj;
    });

    return {
      attempt: {
        id: attempt._id,
        quizId: attempt.quizId,
        startedAt: attempt.startedAt,
        maxAttempts: quiz.maxAttempts,
        attemptNumber: attemptCount + 1,
        timeLimitMinutes: quiz.timeLimitMinutes
      },
      questions: filteredQuestions
    };
  },

  async submitAttempt(userId, courseId, id, attemptId, studentAnswers = []) {
    const quiz = await quizRepository.findQuizById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found', ERROR_CODES.NOT_FOUND);
    }

    const attempt = await quizRepository.findAttemptById(attemptId);
    if (!attempt || attempt.submittedAt !== null) {
      throw new ValidationError('Quiz attempt not found or already submitted');
    }

    if (attempt.studentId.toString() !== userId) {
      throw new ForbiddenError('You cannot submit another student\'s attempt', ERROR_CODES.FORBIDDEN);
    }

    // Fetch correct answers for grading
    const questions = await quizRepository.findQuestionsByQuizId(id);
    
    // Auto-Grade
    let earnedPoints = 0;
    let totalPoints = 0;
    const details = [];

    for (const q of questions) {
      totalPoints += q.points;

      // Find student answer
      const sa = studentAnswers.find(item => item.questionId.toString() === q._id.toString());
      const studentVal = sa ? sa.value.trim() : '';

      let isCorrect = false;
      let qEarned = 0;
      let feedbackComment = '';

      if (q.type === 'speaking' || q.type === 'open_ended') {
        // AI Grading (FR-QUIZ-006 / Step 12 Integration)
        const geminiClient = require('../utils/geminiClient');
        try {
          const aiGrading = await geminiClient.gradeSpeakingOrOpenEnded(q.prompt, q.correctAnswer, studentVal);
          isCorrect = aiGrading.isPassed;
          qEarned = Math.round((aiGrading.score / 100) * q.points);
          feedbackComment = aiGrading.comment;
        } catch (aiErr) {
          console.error('[AI GRADER FAILURE]', aiErr);
          // Fallback auto grade
          isCorrect = studentVal.toLowerCase() === (q.correctAnswer || '').toString().toLowerCase();
          qEarned = isCorrect ? q.points : 0;
        }
      } else {
        const correctVal = q.correctAnswer ? q.correctAnswer.toString().trim().toLowerCase() : '';
        isCorrect = studentVal.toLowerCase() === correctVal;
        qEarned = isCorrect ? q.points : 0;
      }

      earnedPoints += qEarned;

      details.push({
        questionId: q._id,
        prompt: q.prompt,
        options: q.options,
        studentAnswer: sa ? sa.value : '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsEarned: qEarned,
        pointsTotal: q.points,
        feedback: feedbackComment,
        explanation: q.explanation
      });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = score >= quiz.passingScore;
    const timeSpentSeconds = Math.round((Date.now() - attempt.startedAt) / 1000);

    // Enforce BR-QUIZ-003 Time Limit check (with 30s grace)
    if (quiz.timeLimitMinutes) {
      const allowedTime = quiz.timeLimitMinutes * 60 + 30;
      if (timeSpentSeconds > allowedTime) {
        // Enforce time limit rule. We still grade it but log warnings
        console.log(`User ${userId} exceeded time limit for quiz ${id}`);
      }
    }

    const updatedAttempt = await quizRepository.updateAttemptById(attemptId, {
      answers: studentAnswers,
      score,
      isPassed,
      submittedAt: Date.now(),
      timeSpentSeconds
    });

    // Update Progress quizzesPassed (Step 8 integration)
    if (isPassed) {
      try {
        const publishedQuizzes = await Quiz.find({ courseId, status: 'published' }).distinct('_id');
        const uniqueQuizzesPassed = await QuizAttempt.distinct('quizId', {
          studentId: userId,
          quizId: { $in: publishedQuizzes },
          isPassed: true
        });

        await Progress.findOneAndUpdate(
          { studentId: userId, courseId },
          { quizzesPassed: uniqueQuizzesPassed.length, lastStudiedAt: Date.now() },
          { new: true }
        );

        // Check certificate eligibility (Step 10 integration)
        const certificateService = require('./certificateService');
        await certificateService.checkAndIssue(userId, courseId);
      } catch (progressErr) {
        console.error("Failed to update progress stats on quiz pass:", progressErr);
      }
    }

    return {
      attempt: updatedAttempt,
      score,
      isPassed,
      timeSpentSeconds,
      details
    };
  },

  async getAttemptResult(userId, role, id, attemptId) {
    const attempt = await quizRepository.findAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt not found', ERROR_CODES.NOT_FOUND);
    }

    if (attempt.studentId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('No permission to view this attempt result', ERROR_CODES.FORBIDDEN);
    }

    const quiz = await quizRepository.findQuizById(id);
    const questions = await quizRepository.findQuestionsByQuizId(id);

    const details = questions.map(q => {
      const sa = attempt.answers.find(a => a.questionId.toString() === q._id.toString());
      const studentVal = sa ? sa.value.trim().toLowerCase() : '';
      const correctVal = q.correctAnswer ? q.correctAnswer.toString().trim().toLowerCase() : '';
      const isCorrect = studentVal === correctVal;

      return {
        questionId: q._id,
        prompt: q.prompt,
        options: q.options,
        studentAnswer: sa ? sa.value : '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    return {
      attempt,
      score: attempt.score,
      isPassed: attempt.isPassed,
      timeSpentSeconds: attempt.timeSpentSeconds,
      passingScore: quiz.passingScore,
      details
    };
  },

  async getQuizAnalytics(userId, role, quizId) {
    const quiz = await quizRepository.findQuizById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz not found', ERROR_CODES.NOT_FOUND);
    }
    if (quiz.teacherId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('No permission to view analytics for this quiz', ERROR_CODES.FORBIDDEN);
    }

    // Only count each student's most recent submitted attempt, to avoid skewing stats with retries.
    const attempts = await QuizAttempt.find({ quizId, gradingStatus: { $ne: 'pending' }, score: { $ne: null } })
      .sort({ createdAt: -1 })
      .populate('studentId', 'fullName email');

    const latestByStudent = new Map();
    for (const attempt of attempts) {
      const key = attempt.studentId?._id?.toString();
      if (key && !latestByStudent.has(key)) {
        latestByStudent.set(key, attempt);
      }
    }
    const uniqueAttempts = [...latestByStudent.values()];

    const totalAttempts = attempts.length;
    const totalStudents = uniqueAttempts.length;
    const averageScore = totalStudents
      ? Math.round((uniqueAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalStudents) * 10) / 10
      : 0;
    const passedCount = uniqueAttempts.filter((a) => a.isPassed).length;
    const passRate = totalStudents ? Math.round((passedCount / totalStudents) * 100) : 0;

    const scoreBuckets = { '0-49': 0, '50-69': 0, '70-89': 0, '90-100': 0 };
    uniqueAttempts.forEach((a) => {
      const s = a.score || 0;
      if (s < 50) scoreBuckets['0-49'] += 1;
      else if (s < 70) scoreBuckets['50-69'] += 1;
      else if (s < 90) scoreBuckets['70-89'] += 1;
      else scoreBuckets['90-100'] += 1;
    });

    return {
      quizId,
      quizTitle: quiz.title,
      totalAttempts,
      totalStudents,
      averageScore,
      passRate,
      passedCount,
      failedCount: totalStudents - passedCount,
      scoreDistribution: scoreBuckets,
      recentAttempts: uniqueAttempts.slice(0, 20).map((a) => ({
        studentName: a.studentId?.fullName || 'Unknown',
        score: a.score,
        isPassed: a.isPassed,
        submittedAt: a.createdAt
      }))
    };
  }
};

module.exports = quizService;
