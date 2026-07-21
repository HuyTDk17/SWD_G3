const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const TeacherApplication = require('../models/TeacherApplication');
const User = require('../models/User');

const dashboardService = {
  async getStudentDashboard(studentId) {
    const enrollments = await Enrollment.find({ studentId, status: 'active' });
    const courseIds = enrollments.map(e => e.courseId);

    const progressList = await Progress.find({ studentId, courseId: { $in: courseIds } });
    const certificates = await Certificate.countDocuments({ studentId });

    let totalPercent = 0;
    let maxStreak = 0;
    progressList.forEach(p => {
      totalPercent += p.completionPercent || 0;
      if ((p.currentStreak || 0) > maxStreak) {
        maxStreak = p.currentStreak;
      }
    });

    const averageCompletion = progressList.length > 0 ? Math.round(totalPercent / progressList.length) : 0;

    // Get up to 5 courses with title/progress details
    const recentCourses = await Course.find({ _id: { $in: courseIds } })
      .select('title language cefrLevel slug')
      .lean();

    const formattedCourses = recentCourses.map(course => {
      const prog = progressList.find(p => p.courseId && p.courseId.toString() === course._id.toString());
      return {
        ...course,
        completionPercent: prog ? prog.completionPercent : 0,
        lessonsCompleted: prog ? prog.lessonsCompleted : 0,
        totalLessons: prog ? prog.totalLessons : 0
      };
    });

    return {
      activeCourses: enrollments.length,
      completionPercent: averageCompletion,
      currentStreak: maxStreak,
      certificatesEarned: certificates,
      recentCourses: formattedCourses
    };
  },

  async getTeacherDashboard(teacherId) {
    const courses = await Course.find({ teacherId });
    const courseIds = courses.map(c => c._id);

    const activeEnrollments = await Enrollment.countDocuments({
      courseId: { $in: courseIds },
      status: 'active'
    });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;

    let totalRating = 0;
    let coursesWithRating = 0;
    courses.forEach(c => {
      if (c.averageRating > 0) {
        totalRating += c.averageRating;
        coursesWithRating += 1;
      }
    });
    const averageCourseRating = coursesWithRating > 0 ? Math.round((totalRating / coursesWithRating) * 10) / 10 : 0;

    // Fetch quiz attempts that need manual grading (type open_ended / speaking)
    // or just the latest submissions for the teacher's quizzes
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
    const quizIds = quizzes.map(q => q._id);

    const recentSubmissions = await QuizAttempt.find({ quizId: { $in: quizIds } })
      .populate('studentId', 'name email fullName')
      .populate('quizId', 'title courseId')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean();

    return {
      totalStudentsEnrolled: activeEnrollments,
      activeCourses: publishedCourses,
      totalCourses,
      averageRating: averageCourseRating,
      recentSubmissions
    };
  },

  async getAdminDashboard() {
    const totalUsers = await User.countDocuments({});
    
    // Active users: updated or active in past 30 days
    const activeThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers30d = await User.countDocuments({
      status: 'active',
      updatedAt: { $gte: activeThreshold }
    });

    const pendingCourseApprovals = await Course.countDocuments({ status: 'pending_approval' });
    const pendingTeacherApplications = await TeacherApplication.countDocuments({ status: 'pending' });
    const totalEnrollments = await Enrollment.countDocuments({});

    // Simple growth trend: count new users enrolled over past 6 months
    const growthTrend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const count = await Enrollment.countDocuments({
        enrolledAt: { $gte: start, $lt: end }
      });

      const monthName = start.toLocaleString('default', { month: 'short', year: '2-digit' });
      growthTrend.push({ month: monthName, enrollments: count });
    }

    return {
      totalUsers,
      activeUsers30d,
      pendingCourseApprovals,
      pendingTeacherApplications,
      totalEnrollments,
      growthTrend
    };
  },

  async generateCSVReport() {
    const users = await User.find({}).lean();
    
    let csv = 'ID,Name,Email,Role,Status,AI Quota Limit,AI Quota Used,Created At\n';
    
    users.forEach(u => {
      const id = u._id.toString();
      const name = u.fullName || u.name || '';
      const email = u.email || '';
      const role = u.role || 'student';
      const status = u.status || 'active';
      const limit = u.aiQuotaLimit || 50;
      const used = u.aiQuotaUsed || 0;
      const created = u.createdAt ? new Date(u.createdAt).toISOString() : '';
      
      // Escape commas
      const nameEscaped = name.replace(/"/g, '""');
      
      csv += `${id},"${nameEscaped}",${email},${role},${status},${limit},${used},${created}\n`;
    });

    return csv;
  }
};

module.exports = dashboardService;
