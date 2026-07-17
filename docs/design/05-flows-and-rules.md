# 05 — Flows & Business Rules

## 1. Authentication Flows

### 1.1 Registration + OTP Verification

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant API as AuthService
  participant DB as MongoDB
  participant Email as EmailClient

  U->>FE: Fill register form
  FE->>API: POST /auth/register
  API->>DB: Check email unique (BR-AUTH-001)
  alt Email exists
    API-->>FE: 409 EMAIL_ALREADY_REGISTERED
  end
  API->>API: Validate password (BR-AUTH-002)
  API->>DB: Create User (role=student, isEmailVerified=false)
  API->>DB: Create OtpToken (6 digits, 5min TTL)
  API->>Email: Send OTP email (FR-AUTH-002)
  API-->>FE: 201 OTP sent
  U->>FE: Enter OTP
  FE->>API: POST /auth/verify-otp
  API->>DB: Check OTP valid + not expired (BR-AUTH-003)
  API->>DB: Check attempts < 5 (BR-AUTH-004)
  alt Valid OTP
    API->>DB: Set isEmailVerified=true, mark OTP used
    API-->>FE: 200 Account activated
  else Invalid/Expired
    API-->>FE: 400 OTP error
  end
```

### 1.2 Login + Token Refresh

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant API as AuthService
  participant DB as MongoDB

  U->>FE: Login credentials
  FE->>API: POST /auth/login
  API->>DB: Find user by email
  API->>API: Check lockUntil (BR-AUTH-006)
  API->>API: Check isEmailVerified (BR-AUTH-005)
  API->>API: Verify password (bcrypt)
  alt Invalid password
    API->>DB: Increment failedLoginCount
    alt Count >= 5
      API->>DB: Set lockUntil = now + 15min
    end
    API-->>FE: 401 INVALID_CREDENTIALS
  end
  API->>DB: Reset failedLoginCount
  API->>API: Generate accessToken (15min) + refreshToken
  API->>DB: Save RefreshToken
  API-->>FE: 200 tokens + user
  FE->>FE: Store tokens in AuthContext

  Note over FE,API: Later — access token expires
  FE->>API: POST /auth/refresh
  API->>DB: Validate refresh token, not revoked
  API->>DB: Revoke old token (BR-AUTH-007)
  API->>API: Issue new token pair
  API-->>FE: 200 new tokens
```

### 1.3 Google OAuth

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant Google as Google
  participant API as AuthService
  participant DB as MongoDB

  U->>FE: Click "Login with Google"
  FE->>Google: OAuth consent redirect
  Google-->>FE: Authorization code
  FE->>API: POST /auth/google { code }
  API->>Google: Exchange code for profile
  API->>DB: Find user by email or googleId
  alt Email matches existing user
    API->>DB: Link googleId (BR-AUTH-009)
  else New user
    API->>DB: Create User (isEmailVerified=true via Google)
  end
  API-->>FE: 200 tokens + user
```

### 1.4 Auth Business Rules Summary

| Rule ID | Name | Condition | Expected Result | Error |
|---------|------|-----------|-------------------|-------|
| BR-AUTH-001 | Unique Email | Registration | Email not in DB | "Email already registered" |
| BR-AUTH-002 | Password Strength | Register/reset | Min 8, 1 upper, 1 num, 1 symbol | "Password does not meet requirements" |
| BR-AUTH-003 | OTP Expiration | Verify | Within 5 minutes | "OTP has expired" |
| BR-AUTH-004 | OTP Attempt Limit | Verify | Max 5 attempts | "Too many attempts" |
| BR-AUTH-005 | Verified to Login | Login | isEmailVerified=true | "Please verify your email" |
| BR-AUTH-006 | Failed Login Lockout | Login | 5 fails → lock 15min | "Account temporarily locked" |
| BR-AUTH-007 | Refresh Token Rotation | Refresh | Old token single-use | "Invalid refresh token" |
| BR-AUTH-008 | Access Token TTL | Issue | 15 minutes | "Access token expired" |
| BR-AUTH-009 | OAuth Account Linking | OAuth | Match by verified email | "Account linking failed" |
| BR-AUTH-010 | Role on Registration | Register | role=student only | "Invalid role selection" |
| BR-AUTH-011 | Reset Token Single Use | Reset | Mark used after success | "Reset link already used" |
| BR-AUTH-012 | Logout Invalidates Session | Logout | Revoke refresh token | "Session terminated" |

---

## 2. Teacher Application Flow

```mermaid
sequenceDiagram
  participant S as Student
  participant API as UserService
  participant DB as MongoDB
  participant N as NotificationService
  participant A as Admin

  S->>API: POST /users/teacher-application
  API->>API: Validate profile complete (BR-USER-001)
  API->>DB: Create TeacherApplication (pending)
  API->>N: Notify admin (in-app + email)
  A->>API: POST /admin/teacher-applications/:id/approve
  API->>DB: Set application status=approved
  API->>DB: Update User role=teacher
  API->>N: Notify student approved
  API-->>A: 200 Success
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-USER-001 | Profile Completeness | Teacher application | fullName, bio, avatar required |
| BR-USER-002 | One Application Per User | Submit | Only one pending/approved application |
| BR-USER-003 | Rejection Requires Feedback | Admin reject | adminFeedback not empty |

---

## 3. Course Lifecycle Flow

```mermaid
stateDiagram-v2
  [*] --> draft: Teacher creates
  draft --> pending_approval: Submit (>=3 lessons)
  pending_approval --> approved: Admin approves
  pending_approval --> draft: Admin rejects (with reason)
  approved --> published: Teacher/Admin publishes
  published --> archived: Archive action
  published --> pending_approval: Structural edit (BR-COURSE-007)
  archived --> [*]
```

### 3.1 Course Approval Sequence

```mermaid
sequenceDiagram
  participant T as Teacher
  participant API as CourseService
  participant DB as MongoDB
  participant N as NotificationService
  participant A as Admin

  T->>API: POST /courses (create draft)
  API->>DB: Course status=draft (BR-COURSE-003)
  T->>API: POST lessons (>=3)
  T->>API: POST /courses/:id/submit
  API->>API: Validate lessonCount >= 3 (BR-COURSE-002)
  API->>DB: status=pending_approval
  API->>N: Notify admin
  A->>API: POST /courses/:id/approve
  API->>DB: status=approved
  API->>N: Notify teacher
  T->>API: POST /courses/:id/publish
  API->>API: Check status==approved (BR-COURSE-004)
  API->>DB: status=published, publishedAt=now
```

### 3.2 Course Business Rules Summary

| Rule ID | Name | Condition | Expected Result | Error |
|---------|------|-----------|-------------------|-------|
| BR-COURSE-001 | Owner Only Edits | Edit | requester==teacherId or Admin | "No permission" |
| BR-COURSE-002 | Min 3 Lessons to Submit | Submit | lessonCount >= 3 | "Must contain 3 lessons" |
| BR-COURSE-003 | Draft on Creation | Create | status=draft | N/A |
| BR-COURSE-004 | Approval Required to Publish | Publish | status==approved | "Must be approved" |
| BR-COURSE-005 | Rejection Requires Feedback | Reject | rejectionReason not empty | "Reason required" |
| BR-COURSE-006 | Price >= 0 | Create/edit | price >= 0 | "Price must be zero or greater" |
| BR-COURSE-007 | Structural Lock on Published | Edit published | language/cefr change → re-approval | "Requires re-approval" |
| BR-COURSE-008 | Archive Preserves Data | Archive | status=archived, hidden from catalog | N/A |
| BR-COURSE-009 | Unique Slug | Create | slug unique | "Slug already exists" |

---

## 4. Enrollment → Progress Flow

```mermaid
sequenceDiagram
  participant S as Student
  participant API as EnrollmentService
  participant PS as ProgressService
  participant DB as MongoDB
  participant N as NotificationService

  S->>API: POST /enrollments { courseId }
  API->>DB: Check course status=published
  API->>API: Check not already enrolled (BR-ENROLL-001)
  API->>API: Check capacity (BR-ENROLL-003)
  alt Course is paid (price > 0)
    API->>DB: Enrollment status=pending, paymentStatus=pending
    API-->>S: 201 pending payment
    Note over API: Admin/System confirms payment
    API->>DB: status=active, paymentStatus=confirmed
  else Free course
    API->>DB: Enrollment status=active
  end
  API->>PS: Initialize progress (FR-PROGRESS-001)
  PS->>DB: Create Progress (0%, totalLessons from course)
  PS->>DB: Create LessonProgress per lesson
  API->>N: Send enrollment confirmation
  API-->>S: 201 enrollment + progress
```

### 4.1 Lesson Completion + Sequential Lock

```mermaid
sequenceDiagram
  participant S as Student
  participant API as ProgressService
  participant DB as MongoDB

  S->>API: POST /lessons/:id/complete
  API->>DB: Check active enrollment exists
  API->>API: If isSequential: verify prior lessons complete (BR-LESSON-003)
  alt Prior lessons incomplete
    API-->>S: 403 LESSON_LOCKED
  end
  API->>DB: Set LessonProgress.isCompleted=true
  API->>DB: Update Progress.lessonsCompleted, completionPercent
  API->>API: Check milestones (50%, 100%)
  API->>API: Update study streak (BR-PROGRESS-004)
  API-->>S: 200 updated progress
```

### 4.2 Enrollment Business Rules

| Rule ID | Name | Condition | Expected Result | Error |
|---------|------|-----------|-------------------|-------|
| BR-ENROLL-001 | No Duplicate Enrollment | Enroll | Unique student+course | "Already enrolled" |
| BR-ENROLL-002 | Published Course Only | Enroll | course.status=published | "Course not available" |
| BR-ENROLL-003 | Capacity Check | Enroll | active count < capacity | "Course is full" → waitlist |
| BR-ENROLL-004 | Active to Access Content | View lesson | enrollment.status=active | "Enrollment not active" |
| BR-ENROLL-005 | Cancel Preserves History | Cancel | status=cancelled, data kept | N/A |
| BR-ENROLL-006 | Expiration Job | Scheduled | expiresAt passed → status=expired | N/A |
| BR-ENROLL-007 | Progress Init on Enroll | Enroll success | Progress record created | N/A |

---

## 5. Quiz Grading Flow

```mermaid
sequenceDiagram
  participant S as Student
  participant API as QuizService
  participant AI as GeminiClient
  participant DB as MongoDB
  participant PS as ProgressService

  S->>API: POST /quizzes/:id/attempts
  API->>API: Check attempt count < maxAttempts (BR-QUIZ-002)
  API->>DB: Create QuizAttempt (startedAt)
  API-->>S: 200 attempt started + questions

  S->>API: POST /attempts/:aid/submit { answers }
  API->>API: Check time limit not exceeded (BR-QUIZ-003)
  loop Each question
    alt MCQ / fill_blank / matching
      API->>API: Auto-grade (FR-QUIZ-005)
    else open_ended / speaking
      API->>AI: Request AI grading (FR-QUIZ-006, FR-AI-003)
      AI-->>API: Score + feedback
    end
  end
  API->>DB: Update QuizAttempt (score, isPassed, gradingStatus)
  API->>PS: Update quiz progress if passed
  API-->>S: 200 result + feedback
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-QUIZ-001 | Enrolled to Attempt | Start quiz | Active enrollment required |
| BR-QUIZ-002 | Max Attempts | Start | attempts < maxAttempts |
| BR-QUIZ-003 | Time Limit | Submit | submittedAt - startedAt <= timeLimit |
| BR-QUIZ-004 | Passing Score | Grade | score >= passingScore → isPassed |
| BR-QUIZ-005 | Auto Grade Objectives | Submit | MCQ/fill/matching graded instantly |

---

## 6. Review Flow

```mermaid
sequenceDiagram
  participant S as Student
  participant API as ReviewService
  participant DB as MongoDB
  participant N as NotificationService

  S->>API: POST /reviews { courseId, rating, comment }
  API->>DB: Check enrollment status=active or completed (BR-REVIEW-001)
  API->>DB: Check no existing review (unique index)
  API->>DB: Create Review
  API->>DB: Update Course.averageRating (denormalized)
  API->>DB: Update User.teacherRating
  API->>N: Notify teacher (FR-REVIEW-005)
  API-->>S: 201 review created
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-REVIEW-001 | Enrolled to Review | Submit | enrollment exists (active/completed) |
| BR-REVIEW-002 | One Review Per Course | Submit | Unique student+course |
| BR-REVIEW-003 | Rating Range | Submit | 1 <= rating <= 5 |
| BR-REVIEW-004 | Admin Can Moderate | Flag/remove | isRemoved=true, hidden from catalog |

---

## 7. Certificate Flow

```mermaid
sequenceDiagram
  participant PS as ProgressService
  participant CS as CertificateService
  participant DB as MongoDB
  participant Media as CloudinaryClient
  participant N as NotificationService

  PS->>PS: Detect completionPercent=100 (BR-CERT-001)
  PS->>CS: Check final quiz passed (BR-CERT-002)
  CS->>CS: Generate serialNumber
  CS->>Media: Generate PDF certificate
  CS->>DB: Create Certificate
  CS->>N: Notify student (FR-CERT-003)
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-CERT-001 | 100% Completion Required | Issue | completionPercent == 100 |
| BR-CERT-002 | Final Quiz Pass Required | Issue | Final quiz isPassed=true (if exists) |
| BR-CERT-003 | Unique Serial Number | Issue | serialNumber globally unique |
| BR-CERT-004 | Public Verification | GET by serial | Return valid/revoked status |
| BR-CERT-005 | Admin Can Revoke | Revoke | isRevoked=true with reason |

---

## 8. AI Assistant Flow

```mermaid
sequenceDiagram
  participant S as Student
  participant API as AiService
  participant DB as MongoDB
  participant Gemini as GeminiClient

  S->>API: POST /ai/sessions { type, targetLanguage }
  API->>API: Check quota (BR-AI-005, FR-AI-005)
  alt Quota exceeded
    API-->>S: 429 AI_QUOTA_EXCEEDED
  end
  API->>DB: Create AiSession
  API-->>S: 200 session created

  S->>API: POST /ai/sessions/:id/messages { content }
  API->>Gemini: Send prompt with context
  alt Gemini unavailable (BR-AI-006)
    API-->>S: 503 with graceful message
  end
  Gemini-->>API: Response
  API->>DB: Append messages, log usage
  API->>DB: Increment aiQuotaUsed
  API-->>S: 200 assistant message
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-AI-001 | Quota Per User | Each request | aiQuotaUsed < aiQuotaLimit |
| BR-AI-002 | Monthly Reset | Scheduled | Reset aiQuotaUsed monthly |
| BR-AI-003 | Log All Requests | Each request | AiUsageLog created |
| BR-AI-004 | Student Primary Consumer | Access | Student role for chat/grammar |
| BR-AI-005 | Teacher Assisted Grading | Quiz grade | Teacher can trigger AI grade |
| BR-AI-006 | Graceful Degradation | Gemini down | Return friendly error, no crash |

---

## 9. Notification Dispatch Flow

```mermaid
flowchart LR
  subgraph triggers [Event Triggers]
    T1[OTP Sent]
    T2[Enrollment Confirmed]
    T3[Course Approved]
    T4[Certificate Issued]
    T5[Review Received]
    T6[Admin Broadcast]
  end
  subgraph dispatch [NotificationService]
    Check[Check user preferences]
    Email[EmailClient]
    InApp[Create Notification doc]
  end
  T1 --> Check
  T2 --> Check
  T3 --> Check
  T4 --> Check
  T5 --> Check
  T6 --> Check
  Check -->|emailEnabled| Email
  Check -->|inAppEnabled| InApp
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-NOTIF-001 | Respect Preferences | Dispatch | Skip disabled categories |
| BR-NOTIF-002 | Transactional Always On | OTP/reset | Cannot opt out of security emails |
| BR-NOTIF-003 | Retention Cleanup | Job monthly | Delete read notifications > 90 days |

---

## 10. Admin Governance Flow

```mermaid
sequenceDiagram
  participant A as Admin
  participant API as AdminService
  participant DB as MongoDB
  participant AL as AuditLog

  A->>API: PATCH /users/:id/status { status: suspended }
  API->>DB: Update User.status
  API->>AL: Log action (BR-ADMIN-002)
  API-->>A: 200 Success

  A->>API: PATCH /admin/config { key: categories, value: [...] }
  API->>DB: Update SystemConfig
  API->>AL: Log config change
  API-->>A: 200 Success
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-ADMIN-001 | Admin Only Actions | All /admin routes | role==admin |
| BR-ADMIN-002 | Audit All Admin Actions | Any admin mutation | AuditLog entry created |
| BR-ADMIN-003 | Cannot Self-Suspend | Suspend user | actorId != targetId |
| BR-ADMIN-004 | Config Validation | Update config | Valid key from allowed list |

---

## 11. Media Upload Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant API as MediaService
  participant CL as Cloudinary
  participant DB as MongoDB

  U->>FE: Select file
  FE->>API: POST /media/signed-upload
  API-->>FE: Signature + params
  FE->>CL: Direct upload with signature
  CL-->>FE: publicId + url
  FE->>API: POST /media/confirm { publicId, url, type }
  API->>DB: Create MediaAsset
  API-->>FE: 201 assetId
```

| Rule ID | Name | Condition | Expected Result |
|---------|------|-----------|-------------------|
| BR-MEDIA-001 | Signed Upload Only | Upload | Must use signed params |
| BR-MEDIA-002 | Owner Can Delete | Delete | ownerId == requester or Admin |
| BR-MEDIA-003 | Max File Size | Upload | Image 10MB, Video 500MB |
| BR-MEDIA-004 | Orphan Cleanup | Job weekly | Delete orphans > 7 days old |

---

## 12. Cross-Module Event Matrix

| Event | Triggered By | Notifications | Side Effects |
|-------|-------------|---------------|--------------|
| User registered | AuthService | OTP email | Create User |
| Email verified | AuthService | Welcome in-app | isEmailVerified=true |
| Teacher approved | AdminService | Email + in-app | role=teacher |
| Course submitted | CourseService | Admin in-app | status=pending_approval |
| Course published | CourseService | Teacher in-app | Visible in catalog |
| Student enrolled | EnrollmentService | Confirmation email | Create Progress |
| Lesson completed | ProgressService | — | Update %, streak |
| Quiz passed | QuizService | — | Update progress |
| Course 100% | ProgressService | — | Trigger certificate check |
| Certificate issued | CertificateService | Email + in-app | PDF on Cloudinary |
| Review submitted | ReviewService | Teacher in-app | Update ratings |
| Enrollment expired | Job | Email warning | status=expired, block access |
