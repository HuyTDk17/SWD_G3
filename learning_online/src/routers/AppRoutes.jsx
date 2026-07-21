import { Routes, Route } from "react-router-dom";
import CourseCatalogPage from "../pages/CourseCatalogPage";
import MyCourses from "../pages/MyCourses";
import CourseDetailPage from "../pages/CourseDetailPage";
import NotFound from "../pages/NotFound";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import GuestRoute from "../routes/GuestRoute";
import RoleGuard from "../routes/RoleGuard";
import TeacherApplicationPage from "../pages/TeacherApplicationPage";
import TeacherApplicationsPage from "../pages/admin/TeacherApplicationsPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import TeacherCoursesPage from "../pages/teacher/TeacherCoursesPage";
import CourseEditorPage from "../pages/teacher/CourseEditorPage";
import AdminCoursesPage from "../pages/admin/AdminCoursesPage";
import LessonManagementPage from "../pages/teacher/LessonManagementPage";
import LessonEditorPage from "../pages/teacher/LessonEditorPage";
import LessonPlayerPage from "../pages/student/LessonPlayerPage";
import QuizBuilderPage from "../pages/teacher/QuizBuilderPage";
import QuizAttemptPage from "../pages/student/QuizAttemptPage";
import QuizResultPage from "../pages/student/QuizResultPage";
import ProgressPage from "../pages/student/ProgressPage";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage";
import CertificatesPage from "../pages/student/CertificatesPage";
import VerifyCertificatePage from "../pages/VerifyCertificatePage";
import AiAssistantPage from "../pages/student/AiAssistantPage";
import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage";
import AdminLayout from "../pages/admin/AdminLayout";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CourseCatalogPage />} />
      <Route path="/courses/:slug" element={<CourseDetailPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/verify-otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
      <Route path="/courses/:courseSlug/play" element={<ProtectedRoute><LessonPlayerPage /></ProtectedRoute>} />
      <Route path="/courses/:courseSlug/quizzes/:quizId/take" element={<ProtectedRoute><QuizAttemptPage /></ProtectedRoute>} />
      <Route path="/courses/:courseSlug/quizzes/:quizId/results/:attemptId" element={<ProtectedRoute><QuizResultPage /></ProtectedRoute>} />
      <Route path="/courses/:courseSlug/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/my-certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
      <Route path="/certificates/verify/:code" element={<VerifyCertificatePage />} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
      
      {/* Teacher Routes */}
      <Route
        path="/teacher/courses"
        element={<RoleGuard roles={["teacher"]}><TeacherCoursesPage /></RoleGuard>}
      />
      <Route
        path="/teacher/dashboard"
        element={<RoleGuard roles={["teacher"]}><TeacherDashboardPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/new"
        element={<RoleGuard roles={["teacher"]}><CourseEditorPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/edit/:id"
        element={<RoleGuard roles={["teacher"]}><CourseEditorPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/:courseId/lessons"
        element={<RoleGuard roles={["teacher"]}><LessonManagementPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/:courseId/lessons/new"
        element={<RoleGuard roles={["teacher"]}><LessonEditorPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/:courseId/lessons/edit/:id"
        element={<RoleGuard roles={["teacher"]}><LessonEditorPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/:courseId/quizzes/new"
        element={<RoleGuard roles={["teacher"]}><QuizBuilderPage /></RoleGuard>}
      />
      <Route
        path="/teacher/courses/:courseId/quizzes/edit/:id"
        element={<RoleGuard roles={["teacher"]}><QuizBuilderPage /></RoleGuard>}
      />

      <Route
        path="/teacher-application"
        element={<RoleGuard roles={["student"]}><TeacherApplicationPage /></RoleGuard>}
      />
      <Route
        path="/admin/teacher-applications"
        element={<RoleGuard roles={["admin"]}><TeacherApplicationsPage /></RoleGuard>}
      />
      <Route
        path="/admin/users"
        element={<RoleGuard roles={["admin"]}><UserManagementPage /></RoleGuard>}
      />
      <Route
        path="/admin/courses"
        element={<RoleGuard roles={["admin"]}><AdminCoursesPage /></RoleGuard>}
      />
      <Route
        path="/admin/reviews"
        element={<RoleGuard roles={["admin"]}><AdminReviewsPage /></RoleGuard>}
      />
      <Route
        path="/admin/dashboard"
        element={<RoleGuard roles={["admin"]}><AdminLayout /></RoleGuard>}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
