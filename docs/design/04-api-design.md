# 04 — API Design

## 1. Conventions

| Item | Value |
|------|-------|
| Base URL | `/api/v1` |
| Auth header | `Authorization: Bearer <accessToken>` |
| Content-Type | `application/json` |
| Pagination | `?page=1&limit=20` |
| Sort | `?sort=-createdAt` |

### Response envelope

**Success:**
```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password does not meet requirements",
    "details": [{ "field": "password", "message": "..." }]
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | OK — GET, PATCH success |
| 201 | Created — POST success |
| 204 | No content — DELETE success |
| 400 | Validation error |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient role/ownership |
| 404 | Not found |
| 409 | Conflict — duplicate email, enrollment |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 2. Module 1 — Authentication (`/auth`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| POST | `/auth/register` | Public | — | FR-AUTH-001 | Register with email/password |
| POST | `/auth/verify-otp` | Public | — | FR-AUTH-003 | Verify email OTP |
| POST | `/auth/resend-otp` | Public | — | FR-AUTH-002 | Resend OTP |
| POST | `/auth/login` | Public | — | FR-AUTH-004 | Login, receive token pair |
| POST | `/auth/google` | Public | — | FR-AUTH-005 | Google OAuth callback |
| POST | `/auth/refresh` | Public | — | FR-AUTH-006 | Refresh access token |
| POST | `/auth/logout` | Required | All | FR-AUTH-007 | Revoke refresh token |
| POST | `/auth/forgot-password` | Public | — | FR-AUTH-008 | Request reset OTP |
| POST | `/auth/reset-password` | Public | — | FR-AUTH-009 | Reset with OTP |

### POST `/auth/register`

**Request:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "student@example.com",
  "password": "SecureP@ss1"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "message": "OTP sent to email"
  }
}
```

**Errors:** 409 `EMAIL_ALREADY_REGISTERED`, 400 `PASSWORD_WEAK`

### POST `/auth/login`

**Request:**
```json
{ "email": "student@example.com", "password": "SecureP@ss1" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "id": "...",
      "fullName": "Nguyen Van A",
      "email": "student@example.com",
      "role": "student",
      "isEmailVerified": true
    }
  }
}
```

**Errors:** 401 `INVALID_CREDENTIALS`, 403 `EMAIL_NOT_VERIFIED`, 403 `ACCOUNT_LOCKED`

### POST `/auth/refresh`

**Request:**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

## 3. Module 2 — Users (`/users`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/users/me` | Required | All | FR-USER-001 | Get own profile |
| PATCH | `/users/me` | Required | Student, Teacher | FR-USER-002 | Update profile |
| POST | `/users/me/avatar` | Required | All | FR-USER-002 | Upload avatar via Media |
| POST | `/users/teacher-application` | Required | Student | FR-USER-003 | Submit teacher application |
| GET | `/users/teacher-application` | Required | Student | FR-USER-004 | View application status |
| GET | `/users` | Required | Admin | FR-USER-005 | List all users (paginated) |
| PATCH | `/users/:id/status` | Required | Admin | FR-USER-006 | Suspend/ban/restore user |
| PATCH | `/users/:id/role` | Required | Admin | FR-USER-007 | Change user role |

### PATCH `/users/me`

**Request:**
```json
{
  "fullName": "Updated Name",
  "bio": "Language enthusiast",
  "targetLanguages": ["English", "French"],
  "nativeLanguage": "Vietnamese",
  "timezone": "Asia/Ho_Chi_Minh"
}
```

### POST `/users/teacher-application`

**Request:**
```json
{
  "credentials": "CELTA certified, 5 years experience",
  "languagesTaught": ["English"],
  "documentAssetIds": ["..."]
}
```

---

## 4. Module 3 — Media (`/media`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| POST | `/media/signed-upload` | Required | All | FR-MEDIA-002 | Get Cloudinary signed params |
| POST | `/media/confirm` | Required | All | FR-MEDIA-001 | Confirm upload, save MediaAsset |
| GET | `/media/:id` | Required | Owner/Admin | FR-MEDIA-001 | Get asset metadata |
| DELETE | `/media/:id` | Required | Owner/Admin | FR-MEDIA-003 | Delete asset |

### POST `/media/signed-upload`

**Request:**
```json
{ "type": "image", "folder": "course-thumbnails" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "signature": "...",
    "timestamp": 1234567890,
    "apiKey": "...",
    "cloudName": "...",
    "folder": "course-thumbnails"
  }
}
```

---

## 5. Module 4 — Courses (`/courses`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/courses` | Public | — | FR-COURSE-007 | Browse/search catalog |
| GET | `/courses/:id` | Public | — | FR-COURSE-008 | Course detail + reviews |
| GET | `/courses/slug/:slug` | Public | — | FR-COURSE-008 | Detail by slug |
| POST | `/courses` | Required | Teacher | FR-COURSE-001 | Create draft course |
| PATCH | `/courses/:id` | Required | Teacher, Admin | FR-COURSE-002 | Edit course |
| POST | `/courses/:id/submit` | Required | Teacher | FR-COURSE-003 | Submit for approval |
| POST | `/courses/:id/approve` | Required | Admin | FR-COURSE-004 | Approve course |
| POST | `/courses/:id/reject` | Required | Admin | FR-COURSE-004 | Reject with reason |
| POST | `/courses/:id/publish` | Required | Teacher, Admin | FR-COURSE-005 | Publish approved course |
| POST | `/courses/:id/archive` | Required | Teacher, Admin | FR-COURSE-006 | Archive course |
| DELETE | `/courses/:id` | Required | Teacher, Admin | FR-COURSE-006 | Soft delete (archive) |
| GET | `/courses/mine` | Required | Teacher | — | Teacher's own courses |

### GET `/courses` (query params)

```
?language=English
&cefrLevel=A1
&category=Business
&search=beginner
&minPrice=0
&maxPrice=100
&sort=-averageRating
&page=1
&limit=12
```

**Note:** Chỉ trả courses `status=published` cho public. Teacher/Admin thấy own courses qua `/courses/mine`.

### POST `/courses`

**Request:**
```json
{
  "title": "English for Beginners",
  "description": "Start your English journey",
  "language": "English",
  "cefrLevel": "A1",
  "category": "General",
  "price": 0,
  "thumbnailAssetId": "...",
  "capacity": null,
  "durationDays": 90,
  "isSequential": true
}
```

**Response 201:** Course object with `status: "draft"`, auto-generated `slug`.

### POST `/courses/:id/reject`

**Request:**
```json
{ "rejectionReason": "Insufficient lesson content quality" }
```

---

## 6. Module 5 — Lessons (`/courses/:courseId/lessons`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/courses/:courseId/lessons` | Conditional | Student* | FR-LESSON-005 | List lessons (enrolled only) |
| GET | `/courses/:courseId/lessons/:id` | Conditional | Student* | FR-LESSON-005 | View lesson content |
| POST | `/courses/:courseId/lessons` | Required | Teacher | FR-LESSON-001 | Create lesson |
| PATCH | `/courses/:courseId/lessons/:id` | Required | Teacher | FR-LESSON-004 | Edit lesson |
| DELETE | `/courses/:courseId/lessons/:id` | Required | Teacher | — | Delete lesson |
| PUT | `/courses/:courseId/lessons/reorder` | Required | Teacher | FR-LESSON-002 | Reorder lessons |
| POST | `/courses/:courseId/lessons/:id/complete` | Required | Student | FR-LESSON-006 | Mark lesson complete |

*Student must have active enrollment; sequential lock enforced (FR-LESSON-007).

### PUT `/courses/:courseId/lessons/reorder`

**Request:**
```json
{ "lessonIds": ["id1", "id2", "id3"] }
```

---

## 7. Module 6 — Quizzes (`/quizzes`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| POST | `/quizzes` | Required | Teacher | FR-QUIZ-001 | Create quiz |
| PATCH | `/quizzes/:id` | Required | Teacher | FR-QUIZ-001 | Edit quiz |
| POST | `/quizzes/:id/questions` | Required | Teacher | FR-QUIZ-002 | Add questions |
| PATCH | `/quizzes/:id/questions/:qid` | Required | Teacher | FR-QUIZ-002 | Edit question |
| DELETE | `/quizzes/:id/questions/:qid` | Required | Teacher | FR-QUIZ-002 | Delete question |
| POST | `/quizzes/:id/attempts` | Required | Student | FR-QUIZ-003 | Start attempt |
| POST | `/quizzes/:id/attempts/:aid/submit` | Required | Student | FR-QUIZ-004 | Submit answers |
| GET | `/quizzes/:id/attempts/:aid/result` | Required | Student | FR-QUIZ-007 | View result |
| GET | `/quizzes/:id/analytics` | Required | Teacher | FR-QUIZ-008 | Aggregate stats |

### POST `/quizzes/:id/attempts/:aid/submit`

**Request:**
```json
{
  "answers": [
    { "questionId": "...", "value": "option_a" },
    { "questionId": "...", "value": "Paris" },
    { "questionId": "...", "audioAssetId": "..." }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "isPassed": true,
    "gradingStatus": "auto_graded",
    "feedback": [
      { "questionId": "...", "comment": "Correct!", "score": 1 }
    ]
  }
}
```

---

## 8. Module 7 — Enrollments (`/enrollments`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| POST | `/enrollments` | Required | Student | FR-ENROLL-001 | Enroll in course |
| POST | `/enrollments/:id/confirm-payment` | Required | System/Admin | FR-ENROLL-002 | Confirm paid enrollment |
| DELETE | `/enrollments/:id` | Required | Student | FR-ENROLL-003 | Cancel enrollment |
| GET | `/enrollments/me` | Required | Student | FR-ENROLL-004 | My enrollments |
| PATCH | `/enrollments/:id/pin` | Required | Student | — | Pin/unpin (giữ hiện tại) |
| POST | `/enrollments/waitlist` | Required | Student | FR-ENROLL-005 | Join waitlist |
| GET | `/enrollments` | Required | Admin | — | All enrollments |

### POST `/enrollments`

**Request:**
```json
{ "courseId": "..." }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "enrollment": { "id": "...", "status": "active", "enrolledAt": "..." },
    "progress": { "id": "...", "completionPercent": 0 }
  }
}
```

**Errors:** 409 `ALREADY_ENROLLED`, 403 `COURSE_NOT_PUBLISHED`, 409 `COURSE_FULL`

**Migration note:** Endpoint hiện tại `POST /enrollments/enroll` → đổi thành `POST /enrollments`. `GET /enrollments/student/:studentId` → `GET /enrollments/me` (JWT-derived).

---

## 9. Module 8 — Progress (`/progress`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/progress/me` | Required | Student | FR-PROGRESS-005 | All my progress |
| GET | `/progress/course/:courseId` | Required | Student, Teacher | FR-PROGRESS-005 | Progress for one course |
| GET | `/progress/student/:studentId/course/:courseId` | Required | Teacher | FR-PROGRESS-005 | Teacher views student |
| POST | `/progress/course/:courseId/lessons/:lessonId/complete` | Required | Student | FR-PROGRESS-002 | Mark lesson done |

### GET `/progress/course/:courseId`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "completionPercent": 45,
    "lessonsCompleted": 3,
    "totalLessons": 7,
    "currentStreak": 5,
    "studyTimeMinutes": 120,
    "lessonProgress": [
      { "lessonId": "...", "title": "...", "isCompleted": true, "completedAt": "..." }
    ],
    "milestones": ["50_percent"]
  }
}
```

---

## 10. Module 9 — Reviews (`/reviews`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| POST | `/reviews` | Required | Student | FR-REVIEW-001 | Submit review |
| PATCH | `/reviews/:id` | Required | Student | FR-REVIEW-002 | Edit own review |
| DELETE | `/reviews/:id` | Required | Student | FR-REVIEW-002 | Delete own review |
| GET | `/reviews/course/:courseId` | Public | — | — | List course reviews |
| POST | `/reviews/:id/flag` | Required | All | FR-REVIEW-003 | Flag abusive review |
| DELETE | `/reviews/:id/moderate` | Required | Admin | FR-REVIEW-004 | Remove review |

### POST `/reviews`

**Request:**
```json
{
  "courseId": "...",
  "rating": 5,
  "comment": "Excellent course for beginners!"
}
```

**Errors:** 403 `NOT_ENROLLED`, 409 `REVIEW_ALREADY_EXISTS`

---

## 11. Module 10 — Certificates (`/certificates`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/certificates/me` | Required | Student | FR-CERT-004 | My certificates |
| GET | `/certificates/:serialNumber` | Public | — | FR-CERT-003 | Verify certificate |
| POST | `/certificates/generate` | Required | System | FR-CERT-001 | Auto-generate on eligibility |
| POST | `/certificates/:id/revoke` | Required | Admin | FR-CERT-005 | Revoke certificate |

---

## 12. Module 11 — Notifications (`/notifications`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/notifications` | Required | All | FR-NOTIF-003 | Notification feed |
| PATCH | `/notifications/:id/read` | Required | All | FR-NOTIF-004 | Mark one read |
| PATCH | `/notifications/read-all` | Required | All | FR-NOTIF-004 | Mark all read |
| GET | `/notifications/preferences` | Required | All | FR-NOTIF-005 | Get preferences |
| PATCH | `/notifications/preferences` | Required | All | FR-NOTIF-005 | Update preferences |
| POST | `/notifications/broadcast` | Required | Admin | FR-NOTIF-006 | Platform announcement |

---

## 13. Module 12 — AI Assistant (`/ai`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| POST | `/ai/sessions` | Required | Student | FR-AI-001 | Start conversation session |
| POST | `/ai/sessions/:id/messages` | Required | Student | FR-AI-001 | Send message |
| POST | `/ai/grammar` | Required | Student | FR-AI-002 | Grammar correction |
| POST | `/ai/recommendations` | Required | Student | FR-AI-004 | Study recommendations |
| GET | `/ai/quota` | Required | Student | FR-AI-005 | Remaining AI quota |

### POST `/ai/sessions/:id/messages`

**Request:**
```json
{
  "content": "Hello, I want to practice ordering food in English",
  "targetLanguage": "English"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "Great! Let's start. You walk into a restaurant...",
    "quotaRemaining": 42
  }
}
```

**Errors:** 429 `AI_QUOTA_EXCEEDED`

---

## 14. Module 13 — Dashboard (`/dashboard`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/dashboard/student` | Required | Student | FR-DASH-001 | Student dashboard |
| GET | `/dashboard/teacher` | Required | Teacher | FR-DASH-002 | Teacher dashboard |
| GET | `/dashboard/admin` | Required | Admin | FR-DASH-003 | Admin KPIs |
| GET | `/dashboard/admin/export` | Required | Admin | FR-DASH-004 | Export CSV/PDF |

### GET `/dashboard/student`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "activeCourses": 3,
    "completionPercent": 67,
    "currentStreak": 12,
    "certificatesEarned": 1,
    "upcomingLessons": [{ "courseId": "...", "lessonId": "...", "title": "..." }],
    "recentActivity": []
  }
}
```

### GET `/dashboard/admin`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers30d": 340,
    "pendingCourseApprovals": 5,
    "pendingTeacherApplications": 2,
    "totalEnrollments": 890,
    "growthTrend": [{ "month": "2026-01", "users": 100 }]
  }
}
```

---

## 15. Module 14 — Admin (`/admin`)

| Method | Endpoint | Auth | Role | FR | Description |
|--------|----------|------|------|-----|-------------|
| GET | `/admin/teacher-applications` | Required | Admin | FR-ADMIN-001 | Pending applications |
| POST | `/admin/teacher-applications/:id/approve` | Required | Admin | FR-ADMIN-002 | Approve teacher |
| POST | `/admin/teacher-applications/:id/reject` | Required | Admin | FR-ADMIN-002 | Reject teacher |
| GET | `/admin/courses/pending` | Required | Admin | FR-ADMIN-003 | Pending courses |
| GET | `/admin/audit-logs` | Required | Admin | FR-ADMIN-004 | Audit trail |
| GET | `/admin/config` | Required | Admin | FR-ADMIN-005 | System config |
| PATCH | `/admin/config` | Required | Admin | FR-ADMIN-005 | Update config |
| GET | `/admin/reviews/flagged` | Required | Admin | FR-ADMIN-006 | Flagged reviews |

---

## 16. FR → Endpoint Index

| FR ID | Endpoint |
|-------|----------|
| FR-AUTH-001 | POST `/auth/register` |
| FR-AUTH-002 | POST `/auth/resend-otp` |
| FR-AUTH-003 | POST `/auth/verify-otp` |
| FR-AUTH-004 | POST `/auth/login` |
| FR-AUTH-005 | POST `/auth/google` |
| FR-AUTH-006 | POST `/auth/refresh` |
| FR-AUTH-007 | POST `/auth/logout` |
| FR-AUTH-008 | POST `/auth/forgot-password` |
| FR-AUTH-009 | POST `/auth/reset-password` |
| FR-AUTH-010 | Middleware `roleGuard` on all protected routes |
| FR-COURSE-001 | POST `/courses` |
| FR-COURSE-003 | POST `/courses/:id/submit` |
| FR-COURSE-004 | POST `/courses/:id/approve`, `/reject` |
| FR-COURSE-005 | POST `/courses/:id/publish` |
| FR-COURSE-007 | GET `/courses` |
| FR-COURSE-008 | GET `/courses/:id` |
| FR-ENROLL-001 | POST `/enrollments` |
| FR-ENROLL-004 | GET `/enrollments/me` |
| FR-LESSON-005 | GET `/courses/:courseId/lessons/:id` |
| FR-LESSON-006 | POST `/courses/:courseId/lessons/:id/complete` |
| FR-PROGRESS-001 | Auto on POST `/enrollments` |
| FR-QUIZ-003 | POST `/quizzes/:id/attempts` |
| FR-QUIZ-004 | POST `/quizzes/:id/attempts/:aid/submit` |
| FR-REVIEW-001 | POST `/reviews` |
| FR-CERT-001 | POST `/certificates/generate` (internal) |
| FR-AI-001 | POST `/ai/sessions` |
| FR-DASH-001 | GET `/dashboard/student` |
| FR-NOTIF-003 | GET `/notifications` |

---

## 17. Migration từ API hiện tại

| Hiện tại | Target | Breaking change |
|----------|--------|-----------------|
| `GET /course/courses` | `GET /api/v1/courses` | Prefix + plural |
| `GET /course/courses/:id` | `GET /api/v1/courses/:id` | Prefix |
| `POST /course/courses` | `POST /api/v1/courses` | + auth required |
| `POST /enrollments/enroll` | `POST /api/v1/enrollments` | Path change |
| `GET /enrollments/student/:id` | `GET /api/v1/enrollments/me` | JWT-derived |
| `PATCH /enrollments/:id/pin` | `PATCH /api/v1/enrollments/:id/pin` | + auth |
| `DELETE /enrollments/:id` | `DELETE /api/v1/enrollments/:id` | + auth |

Frontend `axiosClient.js` cần update `baseURL` → `VITE_API_BASE_URL` và thêm auth interceptor.
