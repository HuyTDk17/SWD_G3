# 02 — Cấu trúc thư mục

## 1. Tổng quan repo

```
project/
├── docs/
│   └── design/          ← Tài liệu thiết kế (file này)
├── learning_online/     ← Frontend (React 19 + Vite)
├── Backend/             ← Backend (Node + Express)
└── courses.json         ← Sample data (sẽ thay bằng seed script)
```

## 2. Backend — Target Structure

```
Backend/
├── server.js                    # Entry point
├── package.json
├── .env
├── config/
│   ├── db.js                    # MongoDB connection (hiện có)
│   ├── env.js                   # Env validation
│   └── corsConfig.js
├── uploads/                     # Temp staging (runtime, gitignored)
│   └── tmp/
└── src/
    ├── config/                  # Alias hoặc merge vào config/ root
    ├── routes/
    │   ├── index.js             # Mount all routes under /api/v1
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── mediaRoutes.js
    │   ├── courseRoutes.js      # Refactor từ course.js hiện có
    │   ├── lessonRoutes.js
    │   ├── quizRoutes.js
    │   ├── enrollmentRoutes.js  # Refactor từ enrollment.js hiện có
    │   ├── progressRoutes.js
    │   ├── reviewRoutes.js
    │   ├── certificateRoutes.js
    │   ├── notificationRoutes.js
    │   ├── aiRoutes.js
    │   ├── dashboardRoutes.js
    │   └── adminRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── mediaController.js
    │   ├── courseController.js      # Migrate từ controllers/course.js
    │   ├── lessonController.js
    │   ├── quizController.js
    │   ├── enrollmentController.js  # Migrate từ controllers/enrollment.js
    │   ├── progressController.js
    │   ├── reviewController.js
    │   ├── certificateController.js
    │   ├── notificationController.js
    │   ├── aiController.js
    │   ├── dashboardController.js
    │   └── adminController.js
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── roleGuard.js
    │   ├── validateMiddleware.js
    │   ├── rateLimiter.js
    │   ├── uploadMiddleware.js    # Multer config
    │   └── errorHandler.js
    ├── services/
    │   ├── authService.js
    │   ├── userService.js
    │   ├── mediaService.js
    │   ├── courseService.js
    │   ├── lessonService.js
    │   ├── quizService.js
    │   ├── enrollmentService.js
    │   ├── progressService.js
    │   ├── reviewService.js
    │   ├── certificateService.js
    │   ├── notificationService.js
    │   ├── aiService.js
    │   ├── dashboardService.js
    │   └── adminService.js
    ├── repositories/
    │   ├── userRepository.js
    │   ├── refreshTokenRepository.js
    │   ├── otpTokenRepository.js
    │   ├── teacherApplicationRepository.js
    │   ├── courseRepository.js
    │   ├── lessonRepository.js
    │   ├── quizRepository.js
    │   ├── enrollmentRepository.js
    │   ├── progressRepository.js
    │   ├── reviewRepository.js
    │   ├── certificateRepository.js
    │   ├── notificationRepository.js
    │   ├── mediaAssetRepository.js
    │   ├── aiSessionRepository.js
    │   ├── systemConfigRepository.js
    │   └── auditLogRepository.js
    ├── models/
    │   ├── User.js
    │   ├── RefreshToken.js
    │   ├── OtpToken.js
    │   ├── TeacherApplication.js
    │   ├── Course.js              # Extend schema hiện có
    │   ├── Lesson.js
    │   ├── Quiz.js
    │   ├── Question.js
    │   ├── QuizAttempt.js
    │   ├── Enrollment.js          # Extend schema hiện có
    │   ├── Progress.js
    │   ├── LessonProgress.js
    │   ├── Review.js
    │   ├── Certificate.js
    │   ├── Notification.js
    │   ├── NotificationPreference.js
    │   ├── MediaAsset.js
    │   ├── AiSession.js
    │   ├── AiUsageLog.js
    │   ├── SystemConfig.js
    │   └── AuditLog.js
    ├── validators/
    │   ├── authValidator.js
    │   ├── userValidator.js
    │   ├── courseValidator.js
    │   ├── lessonValidator.js
    │   ├── quizValidator.js
    │   └── enrollmentValidator.js
    ├── integrations/
    │   ├── cloudinaryClient.js
    │   ├── geminiClient.js
    │   ├── googleOAuthClient.js
    │   └── emailClient.js
    ├── jobs/
    │   ├── expireEnrollments.job.js
    │   ├── cleanupOrphanAssets.job.js
    │   ├── refreshDashboardKpis.job.js
    │   └── notificationRetention.job.js
    ├── exceptions/
    │   ├── AppError.js
    │   ├── ValidationError.js
    │   ├── UnauthorizedError.js
    │   ├── ForbiddenError.js
    │   ├── NotFoundError.js
    │   └── ConflictError.js
    ├── constants/
    │   ├── roles.js
    │   ├── courseStatus.js
    │   ├── enrollmentStatus.js
    │   ├── lessonStatus.js
    │   ├── quizTypes.js
    │   ├── questionTypes.js
    │   ├── notificationTypes.js
    │   └── errorCodes.js
    ├── utils/
    │   ├── generateToken.js
    │   ├── hashPassword.js
    │   ├── paginate.js
    │   ├── slugify.js
    │   └── logger.js
    └── logs/                    # Runtime-generated, gitignored
        ├── app.log
        └── audit.log
```

## 3. Frontend — Target Structure

```
learning_online/
├── index.html
├── package.json
├── vite.config.js
├── .env
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── assets/
    │   ├── images/
    │   │   ├── logo.svg
    │   │   └── flags/
    │   └── fonts/
    ├── components/
    │   ├── common/
    │   │   ├── Button.jsx
    │   │   ├── Modal.jsx
    │   │   ├── DataTable.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── EmptyState.jsx
    │   ├── course/
    │   │   ├── CourseCard.jsx       # Migrate từ components/CourseCard.jsx
    │   │   ├── CourseFilter.jsx
    │   │   └── CourseForm.jsx
    │   ├── lesson/
    │   │   ├── LessonList.jsx
    │   │   ├── LessonPlayer.jsx
    │   │   └── VocabularyList.jsx
    │   ├── quiz/
    │   │   ├── QuizQuestion.jsx
    │   │   ├── QuizTimer.jsx
    │   │   └── QuizResult.jsx
    │   ├── auth/
    │   │   ├── LoginForm.jsx
    │   │   ├── RegisterForm.jsx
    │   │   └── OtpVerifyForm.jsx
    │   └── layout/
    │       └── Navbar.jsx           # Migrate từ components/Navbar.jsx
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── VerifyOtpPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   └── ResetPasswordPage.jsx
    │   ├── student/
    │   │   ├── CourseCatalogPage.jsx    # Migrate từ pages/CourseList.jsx
    │   │   ├── CourseDetailPage.jsx     # Migrate từ components/Coursedetail.jsx
    │   │   ├── MyCoursesPage.jsx        # Migrate từ pages/MyCourses.jsx
    │   │   ├── LessonPlayerPage.jsx
    │   │   ├── QuizAttemptPage.jsx
    │   │   ├── ProgressPage.jsx
    │   │   ├── CertificatesPage.jsx
    │   │   ├── AiAssistantPage.jsx
    │   │   └── StudentDashboardPage.jsx
    │   ├── teacher/
    │   │   ├── TeacherDashboardPage.jsx
    │   │   ├── CourseEditorPage.jsx
    │   │   ├── LessonEditorPage.jsx
    │   │   ├── QuizBuilderPage.jsx
    │   │   └── StudentProgressPage.jsx
    │   ├── admin/
    │   │   ├── AdminDashboardPage.jsx
    │   │   ├── UserManagementPage.jsx
    │   │   ├── CourseApprovalPage.jsx
    │   │   ├── TeacherApprovalPage.jsx
    │   │   ├── ReviewModerationPage.jsx
    │   │   ├── SystemConfigPage.jsx
    │   │   └── AuditLogPage.jsx
    │   └── NotFound.jsx                 # Giữ pages/NotFound.jsx
    ├── layouts/
    │   ├── AuthLayout.jsx
    │   ├── StudentLayout.jsx
    │   ├── TeacherLayout.jsx
    │   └── AdminLayout.jsx
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useEnrollment.js
    │   ├── usePagination.js
    │   ├── useDebouncedSearch.js
    │   └── useQuizTimer.js
    ├── contexts/
    │   ├── AuthContext.jsx
    │   └── NotificationContext.jsx
    ├── services/
    │   ├── authService.js
    │   ├── userService.js
    │   ├── courseService.js           # Wrap courseApi hiện có
    │   ├── lessonService.js
    │   ├── quizService.js
    │   ├── enrollmentService.js       # Wrap enrollmentApi hiện có
    │   ├── progressService.js
    │   ├── reviewService.js
    │   ├── certificateService.js
    │   ├── notificationService.js
    │   ├── mediaService.js
    │   ├── aiService.js
    │   └── dashboardService.js
    ├── api/
    │   ├── axiosClient.js             # Extend: interceptors, refresh
    │   ├── interceptors.js
    │   ├── authApi.js
    │   ├── userApi.js
    │   ├── courseApi.js               # Hiện có — extend
    │   ├── lessonApi.js
    │   ├── quizApi.js
    │   ├── enrollmentApi.js           # Hiện có — extend
    │   ├── progressApi.js
    │   ├── reviewApi.js
    │   ├── certificateApi.js
    │   ├── notificationApi.js
    │   ├── mediaApi.js
    │   ├── aiApi.js
    │   └── dashboardApi.js
    ├── routes/
    │   ├── AppRoutes.jsx              # Refactor — role-based routing
    │   ├── ProtectedRoute.jsx
    │   └── roleGuards.js
    ├── validators/
    │   ├── registerSchema.js
    │   ├── loginSchema.js
    │   ├── courseSchema.js
    │   └── quizSchema.js
    ├── constants/
    │   ├── roles.js
    │   ├── apiEndpoints.js
    │   ├── courseStatus.js
    │   ├── cefrLevels.js
    │   └── quizTypes.js
    ├── utils/
    │   ├── formatDate.js
    │   ├── calculateProgress.js
    │   └── debounce.js
    ├── config/
    │   ├── env.js
    │   └── oauthConfig.js
    └── styles/
        ├── theme.js                   # MUI theme
        ├── globals.css                # Migrate từ assets/css/styles.css
        └── typography.js
```

## 4. Mapping: Hiện tại → Target

### 4.1 Backend

| Hiện tại | Target | Hành động |
|----------|--------|-----------|
| `Backend/server.js` | `Backend/server.js` | Thêm mount `/api/v1`, error handler, job scheduler |
| `Backend/config/db.js` | `Backend/config/db.js` | Giữ |
| `Backend/src/routers/course.js` | `Backend/src/routes/courseRoutes.js` | Rename + thin route layer |
| `Backend/src/routers/enrollment.js` | `Backend/src/routes/enrollmentRoutes.js` | Rename + thin route layer |
| `Backend/src/routers/index.js` | `Backend/src/routes/index.js` | Version prefix `/api/v1` |
| `Backend/src/controllers/course.js` | `controllers/` + `services/courseService.js` | Extract business logic |
| `Backend/src/controllers/enrollment.js` | `controllers/` + `services/enrollmentService.js` | Extract business logic |
| `Backend/src/models/Course.js` | `models/Course.js` | Extend fields (status, slug, cefrLevel, ...) |
| `Backend/src/models/Enrollment.js` | `models/Enrollment.js` | Extend fields (status, expiresAt, ...) |
| `Backend/seedCourses.js` | `Backend/scripts/seedAll.js` | Unified seed |

### 4.2 Frontend

| Hiện tại | Target | Hành động |
|----------|--------|-----------|
| `src/pages/CourseList.jsx` | `pages/student/CourseCatalogPage.jsx` | Move + add filters |
| `src/components/Coursedetail.jsx` | `pages/student/CourseDetailPage.jsx` | Move to pages |
| `src/pages/MyCourses.jsx` | `pages/student/MyCoursesPage.jsx` | Move + auth context |
| `src/components/CourseCard.jsx` | `components/course/CourseCard.jsx` | Move |
| `src/components/Navbar.jsx` | `components/layout/Navbar.jsx` | Move + role menu |
| `src/routers/AppRoutes.jsx` | `routes/AppRoutes.jsx` | Rename folder + guards |
| `src/api/axiosClient.js` | `api/axiosClient.js` | Add interceptors |
| `src/api/courseApi.js` | `api/courseApi.js` + `services/courseService.js` | Split layers |
| `src/assets/css/styles.css` | `styles/globals.css` | Move + MUI theme |

## 5. Module-to-Folder Mapping

| Module | Backend folders | Frontend folders |
|--------|----------------|------------------|
| Auth | routes, controllers, services, repositories, models, integrations | pages/auth, contexts, hooks, api |
| User | routes, controllers, services, repositories, models | pages/teacher (application), services |
| Media | routes, controllers, services, integrations, jobs | services/mediaService, api |
| Course | routes, controllers, services, repositories, models | pages/student, pages/teacher, components/course |
| Lesson | routes, controllers, services, repositories, models | pages/student/LessonPlayerPage, components/lesson |
| Quiz | routes, controllers, services, repositories, models | pages/student/QuizAttemptPage, components/quiz |
| Enrollment | routes, controllers, services, repositories, models | pages/student/MyCoursesPage, hooks |
| Progress | routes, controllers, services, repositories, models | pages/student/ProgressPage |
| Review | routes, controllers, services, repositories, models | components trong CourseDetailPage |
| Certificate | routes, controllers, services, repositories, models | pages/student/CertificatesPage |
| Notification | routes, controllers, services, repositories, models, integrations | contexts/NotificationContext |
| AI | routes, controllers, services, integrations | pages/student/AiAssistantPage |
| Dashboard | routes, controllers, services, jobs | pages/*/DashboardPage |
| Admin | routes, controllers, services, repositories, models | pages/admin/* |

## 6. Naming Conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Route file | `{module}Routes.js` | `courseRoutes.js` |
| Controller | `{module}Controller.js` | `courseController.js` |
| Service | `{module}Service.js` | `courseService.js` |
| Repository | `{entity}Repository.js` | `courseRepository.js` |
| Model | PascalCase singular | `Course.js` |
| Frontend page | `{Name}Page.jsx` | `CourseCatalogPage.jsx` |
| Frontend hook | `use{Name}.js` | `useAuth.js` |
| API constant | `SCREAMING_SNAKE` | `API_ENDPOINTS.COURSES` |

## 7. Files không commit

```
Backend/uploads/tmp/*
Backend/logs/*
Backend/.env
learning_online/.env
node_modules/
dist/
```
