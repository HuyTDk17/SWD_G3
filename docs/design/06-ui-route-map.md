# 06 — UI Route Map

## 1. Layout Strategy

Mỗi role có layout riêng với navigation chrome persistent:

| Layout | Used by | Shell features |
|--------|---------|----------------|
| `AuthLayout` | Login, Register, OTP, Forgot/Reset | Centered card, no sidebar, brand logo |
| `StudentLayout` | Student pages | Top navbar + sidebar (My Courses, Progress, AI, Certificates) |
| `TeacherLayout` | Teacher pages | Top navbar + sidebar (My Courses, Create, Analytics) |
| `AdminLayout` | Admin pages | Top navbar + sidebar (Users, Approvals, Config, Audit) |

Public pages (course catalog, course detail) dùng `StudentLayout` nhưng không yêu cầu auth — navbar hiển thị Login/Register thay vì user menu.

## 2. Route Map

### 2.1 Public Routes (no auth)

| Path | Page | Layout | Description |
|------|------|--------|-------------|
| `/` | `CourseCatalogPage` | StudentLayout | Browse published courses |
| `/courses/:slug` | `CourseDetailPage` | StudentLayout | Course detail, reviews, enroll CTA |

### 2.2 Auth Routes (guest only)

| Path | Page | Layout | Guard |
|------|------|--------|-------|
| `/login` | `LoginPage` | AuthLayout | `GuestGuard` — redirect if logged in |
| `/register` | `RegisterPage` | AuthLayout | `GuestGuard` |
| `/verify-otp` | `VerifyOtpPage` | AuthLayout | `GuestGuard` |
| `/forgot-password` | `ForgotPasswordPage` | AuthLayout | `GuestGuard` |
| `/reset-password` | `ResetPasswordPage` | AuthLayout | `GuestGuard` |
| `/auth/google/callback` | OAuth handler | AuthLayout | Processes Google redirect |

### 2.3 Student Routes (auth + role: student)

| Path | Page | Layout | Guard |
|------|------|--------|-------|
| `/my-courses` | `MyCoursesPage` | StudentLayout | `ProtectedRoute` |
| `/my-courses/:courseId` | Course learning hub | StudentLayout | `ProtectedRoute` + enrolled |
| `/learn/:courseId/lessons/:lessonId` | `LessonPlayerPage` | StudentLayout | `ProtectedRoute` + enrolled |
| `/learn/:courseId/quizzes/:quizId` | `QuizAttemptPage` | StudentLayout | `ProtectedRoute` + enrolled |
| `/progress` | `ProgressPage` | StudentLayout | `ProtectedRoute` |
| `/progress/:courseId` | Progress detail | StudentLayout | `ProtectedRoute` |
| `/certificates` | `CertificatesPage` | StudentLayout | `ProtectedRoute` |
| `/ai-assistant` | `AiAssistantPage` | StudentLayout | `ProtectedRoute` |
| `/dashboard` | `StudentDashboardPage` | StudentLayout | `ProtectedRoute` |
| `/profile` | Profile settings | StudentLayout | `ProtectedRoute` |
| `/notifications` | Notification feed | StudentLayout | `ProtectedRoute` |
| `/teacher-application` | Apply to teach | StudentLayout | `ProtectedRoute` |

### 2.4 Teacher Routes (auth + role: teacher)

| Path | Page | Layout | Guard |
|------|------|--------|-------|
| `/teacher/dashboard` | `TeacherDashboardPage` | TeacherLayout | `RoleGuard(teacher)` |
| `/teacher/courses` | My created courses | TeacherLayout | `RoleGuard(teacher)` |
| `/teacher/courses/new` | `CourseEditorPage` (create) | TeacherLayout | `RoleGuard(teacher)` |
| `/teacher/courses/:id/edit` | `CourseEditorPage` (edit) | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/courses/:id/lessons` | Lesson management | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/courses/:id/lessons/:lessonId/edit` | `LessonEditorPage` | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/courses/:id/quizzes` | Quiz management | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/courses/:id/quizzes/:quizId/edit` | `QuizBuilderPage` | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/courses/:id/students` | `StudentProgressPage` | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/courses/:id/analytics` | Quiz analytics | TeacherLayout | `RoleGuard(teacher)` + owner |
| `/teacher/profile` | Profile settings | TeacherLayout | `RoleGuard(teacher)` |

### 2.5 Admin Routes (auth + role: admin)

| Path | Page | Layout | Guard |
|------|------|--------|-------|
| `/admin/dashboard` | `AdminDashboardPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/users` | `UserManagementPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/teacher-applications` | `TeacherApprovalPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/courses/pending` | `CourseApprovalPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/reviews` | `ReviewModerationPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/certificates` | Certificate oversight | AdminLayout | `RoleGuard(admin)` |
| `/admin/config` | `SystemConfigPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/audit-logs` | `AuditLogPage` | AdminLayout | `RoleGuard(admin)` |
| `/admin/announcements` | Broadcast page | AdminLayout | `RoleGuard(admin)` |

### 2.6 Fallback

| Path | Page | Layout |
|------|------|--------|
| `*` | `NotFound` | Minimal |

## 3. Route Configuration (React Router)

```jsx
// routes/AppRoutes.jsx (target structure)
<Routes>
  {/* Public */}
  <Route element={<StudentLayout />}>
    <Route path="/" element={<CourseCatalogPage />} />
    <Route path="/courses/:slug" element={<CourseDetailPage />} />
  </Route>

  {/* Auth (guest only) */}
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
    <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
    <Route path="/verify-otp" element={<VerifyOtpPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Route>

  {/* Student */}
  <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
    <Route path="/my-courses" element={<MyCoursesPage />} />
    <Route path="/learn/:courseId/lessons/:lessonId" element={<LessonPlayerPage />} />
    <Route path="/learn/:courseId/quizzes/:quizId" element={<QuizAttemptPage />} />
    <Route path="/progress" element={<ProgressPage />} />
    <Route path="/certificates" element={<CertificatesPage />} />
    <Route path="/ai-assistant" element={<AiAssistantPage />} />
    <Route path="/dashboard" element={<StudentDashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/teacher-application" element={<TeacherApplicationPage />} />
  </Route>

  {/* Teacher */}
  <Route element={<RoleGuard roles={['teacher']}><TeacherLayout /></RoleGuard>}>
    <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
    <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
    <Route path="/teacher/courses/new" element={<CourseEditorPage />} />
    <Route path="/teacher/courses/:id/edit" element={<CourseEditorPage />} />
    <Route path="/teacher/courses/:id/lessons" element={<LessonManagementPage />} />
    <Route path="/teacher/courses/:id/lessons/:lessonId/edit" element={<LessonEditorPage />} />
    <Route path="/teacher/courses/:id/quizzes/:quizId/edit" element={<QuizBuilderPage />} />
    <Route path="/teacher/courses/:id/students" element={<StudentProgressPage />} />
  </Route>

  {/* Admin */}
  <Route element={<RoleGuard roles={['admin']}><AdminLayout /></RoleGuard>}>
    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
    <Route path="/admin/users" element={<UserManagementPage />} />
    <Route path="/admin/teacher-applications" element={<TeacherApprovalPage />} />
    <Route path="/admin/courses/pending" element={<CourseApprovalPage />} />
    <Route path="/admin/reviews" element={<ReviewModerationPage />} />
    <Route path="/admin/config" element={<SystemConfigPage />} />
    <Route path="/admin/audit-logs" element={<AuditLogPage />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

## 4. Guard Matrix

| Guard | Checks | Redirect on fail |
|-------|--------|------------------|
| `GuestGuard` | User NOT authenticated | `/dashboard` or role-specific home |
| `ProtectedRoute` | User authenticated (valid JWT) | `/login` |
| `RoleGuard(teacher)` | auth + role in `['teacher', 'admin']` | `/` or 403 page |
| `RoleGuard(admin)` | auth + role == `admin` | `/` or 403 page |
| `EnrollmentGuard` | auth + active enrollment for courseId | `/courses/:slug` with message |
| `OwnerGuard` | auth + user owns resource | 403 page |

### Post-login redirect

| Role | Default redirect |
|------|-----------------|
| `student` | `/dashboard` |
| `teacher` | `/teacher/dashboard` |
| `admin` | `/admin/dashboard` |

## 5. Navigation Menus

### Student Sidebar

```
Dashboard
My Courses
Progress
Certificates
AI Assistant
─────────────
Apply to Teach
Profile
Notifications
Logout
```

### Teacher Sidebar

```
Dashboard
My Courses
  └─ Create New Course
─────────────
Profile
Notifications
Logout
```

### Admin Sidebar

```
Dashboard
Users
Teacher Applications
Course Approvals
Review Moderation
System Config
Audit Logs
Announcements
─────────────
Logout
```

### Public Navbar (unauthenticated)

```
[Logo] Language Learning Platform
                    Catalog | Login | Register
```

### Authenticated Navbar (student)

```
[Logo] Language Learning Platform
     Catalog | My Courses | [Bell icon] | [Avatar menu ▾]
                                              Profile
                                              Logout
```

## 6. Page-to-API Mapping

| Page | Primary API calls |
|------|-------------------|
| `CourseCatalogPage` | `GET /courses?status=published` |
| `CourseDetailPage` | `GET /courses/:id`, `GET /reviews/course/:id`, `POST /enrollments` |
| `MyCoursesPage` | `GET /enrollments/me`, `PATCH /enrollments/:id/pin`, `DELETE /enrollments/:id` |
| `LessonPlayerPage` | `GET /courses/:id/lessons/:lid`, `POST /lessons/:id/complete` |
| `QuizAttemptPage` | `POST /quizzes/:id/attempts`, `POST /attempts/:aid/submit` |
| `LoginPage` | `POST /auth/login` |
| `RegisterPage` | `POST /auth/register` |
| `CourseEditorPage` | `POST/PATCH /courses`, `POST /media/signed-upload` |
| `AdminDashboardPage` | `GET /dashboard/admin` |
| `AiAssistantPage` | `POST /ai/sessions`, `POST /ai/sessions/:id/messages` |

## 7. Migration từ routes hiện tại

| Hiện tại | Target | Notes |
|----------|--------|-------|
| `/` → `CourseList` | `/` → `CourseCatalogPage` | Rename + add filters |
| `/courses/:id` → `CourseDetail` | `/courses/:slug` → `CourseDetailPage` | Switch to slug URL |
| `/my-courses` → `MyCourses` | `/my-courses` → `MyCoursesPage` | Add auth guard |
| No auth routes | `/login`, `/register`, etc. | New |
| No role routes | `/teacher/*`, `/admin/*` | New |
| `components/Coursedetail` | `pages/student/CourseDetailPage` | Move to pages |

## 8. MUI Theme & Responsive

- **Breakpoints:** xs (mobile), sm (tablet), md (desktop), lg (wide)
- **Course catalog:** Grid 1 col (xs) → 2 col (sm) → 3 col (md) → 4 col (lg)
- **Lesson player:** Full-width video on mobile; sidebar curriculum on desktop
- **Admin tables:** Horizontal scroll on mobile; full DataTable on desktop
- **Theme file:** `styles/theme.js` — primary color aligned with language-learning brand (not default MUI blue)

## 9. Key UI States

Mỗi page phải handle:

| State | UI treatment |
|-------|-------------|
| Loading | `LoadingSpinner` centered |
| Empty | `EmptyState` with CTA |
| Error | Toast/snackbar + retry button |
| Unauthorized | Redirect to login |
| Forbidden | 403 page with "Go back" link |
