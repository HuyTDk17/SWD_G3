import { Routes, Route } from "react-router-dom";
import CourseList from "../pages/CourseList";
import MyCourses from "../pages/MyCourses";
import CourseDetail from "../components/Coursedetail";
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetail />} />

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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
