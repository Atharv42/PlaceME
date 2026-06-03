# 05 — API Reference

All endpoints are prefixed with `/api`. The base URL in development is `http://localhost:3000`.

---

## Middleware Applied to Routes

| Middleware | File | What It Does |
|---|---|---|
| `express.json()` | `server.js` | Parses JSON request bodies |
| `cors()` | `server.js` | Allows cross-origin requests from the Vite dev server |
| `verifyToken` | `authMiddleware.js` | Reads Bearer token, verifies JWT signature and expiry, attaches `req.user` |
| `checkRole(role)` | `authMiddleware.js` | Checks `req.user.role === role`, returns 403 if mismatch |
| `StudentSignup` / `CompanySignup` / etc. | `authValidation.js` | Joi schema validation; returns 400 with error message if body is invalid |
| `multer.single('resume')` | `studentRoutes.js` | Parses `multipart/form-data`, saves PDF to `src/server/uploads/`, rejects non-PDF or files > 5MB |

---

## Auth Routes

Mounted at: `app.use('/api', authRoutes)` in `server.js`

| Method | Route | Auth | Role | Middleware | What It Does |
|---|---|---|---|---|---|
| POST | `/api/student-register` | None | — | StudentSignup (Joi) | Creates a student account; hashes password with bcrypt |
| POST | `/api/company-register` | None | — | CompanySignup (Joi) | Creates a company account with `isVerified: false` |
| POST | `/api/admin-register` | None | — | AdminSignup (Joi) | Creates admin; fails if one already exists |
| POST | `/api/login` | None | — | LoginValidation (Joi) | Validates credentials across all 3 collections; returns JWT + role |
| POST | `/api/forgot-password` | None | — | None | Sends password reset email; always returns 200 (anti-enumeration) |
| POST | `/api/reset-password/:token` | None | — | None | Validates the token hash and expiry; updates password; deletes token |

**Login request/response:**
```json
// Request body
{ "email": "student@example.com", "password": "secret123" }

// Success response (200)
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1...",
  "role": "student",
  "userId": "64a1f2b3c4d5e6f7a8b9c0d1",
  "email": "student@example.com"
}
```

---

## Student Routes

Mounted at: `app.use('/api', studentRoutes)` in `server.js`

| Method | Route | Auth | Role | Middleware | What It Does |
|---|---|---|---|---|---|
| GET | `/api/student/profile/:studentId` | ✅ | student | verifyToken, checkRole | Returns student document (password excluded) |
| PUT | `/api/student/profile/:studentId` | ✅ | student | verifyToken, checkRole, StudentProfileUpdateValidation | Updates student profile fields |
| POST | `/api/student/profile/:studentId/upload-resume` | ✅ | student | verifyToken, checkRole, multer.single('resume') | Saves PDF to disk, updates `resumeUrl` in student document |

**Upload resume request:**
```
Content-Type: multipart/form-data
Field: resume (PDF file, max 5MB)
```

---

## Company Routes

Mounted at: `app.use('/api', companyRoutes)` in `server.js`

| Method | Route | Auth | Role | Middleware | What It Does |
|---|---|---|---|---|---|
| GET | `/api/company/profile/:companyId` | ✅ | any | verifyToken | Returns company profile (password + isVerified excluded) |
| PUT | `/api/company/profile/:companyId` | ✅ | company | verifyToken, checkRole, CompanyProfileUpdateValidation | Updates website, description, logoUrl. Enforces ownership: `companyId !== req.user.id` → 403 |

---

## Job Routes

Mounted at: `app.use('/api', jobRoutes)` in `server.js`

| Method | Route | Auth | Role | Middleware | What It Does |
|---|---|---|---|---|---|
| POST | `/api/jobs` | ✅ | company | verifyToken, checkRole, JobPostingValidation | Creates a new job. Validates deadline is in the future. |
| GET | `/api/jobs` | ✅ | student | verifyToken, checkRole | Returns all jobs. Supports `?search=` (title/skill regex) and `?location=` query params. |
| GET | `/api/jobs/:jobId` | ✅ | company | verifyToken, checkRole | Returns a single job. Enforces that the requesting company owns the job. |
| PUT | `/api/jobs/:jobId` | ✅ | company | verifyToken, checkRole | Updates a job. Enforces ownership. |

**POST /api/jobs request body:**
```json
{
  "companyId": "64a1f2b3c4d5e6f7a8b9c0d1",
  "title": "Software Engineer Intern",
  "description": "We are looking for...",
  "location": "Bangalore, India",
  "skillsRequired": ["JavaScript", "React", "Node.js"],
  "deadline": "2024-06-30T00:00:00.000Z",
  "postedDate": "2024-03-01T00:00:00.000Z",
  "company": "Tech Corp"
}
```

---

## Application Routes

Mounted at: `app.use('/api', applicationRoutes)` in `server.js`

| Method | Route | Auth | Role | Middleware | What It Does |
|---|---|---|---|---|---|
| POST | `/api/apply-job` | ✅ | student | verifyToken, checkRole, ApplyJobValidation | Creates an application. Prevents duplicate applications. |
| GET | `/api/student/applications/:studentId` | ✅ | student | verifyToken, checkRole | Returns all applications for a student, enriched with job title and company name. |
| GET | `/api/company/applications/:companyId` | ✅ | company | verifyToken, checkRole | Returns all applications across all company jobs, enriched with student details. |
| GET | `/api/jobs/:jobId/applications` | ✅ | company | verifyToken, checkRole | Returns applications for one specific job. Enforces company ownership of the job. |
| PUT | `/api/applications/:applicationId/status` | ✅ | company | verifyToken, checkRole, UpdateStatusValidation | Updates `status` field. Validates company owns the job the application is for. |

---

## Interview Routes

Mounted at: `app.use('/api', interviewRoutes)` in `server.js`

| Method | Route | Auth | Role | Middleware | What It Does |
|---|---|---|---|---|---|
| POST | `/api/interviews` | ✅ | company | verifyToken, checkRole, InterviewSchedulingValidation | Creates an interview. Validates `type`, date is future, link is required for Virtual. |
| GET | `/api/student/interviews/:studentId` | ✅ | student | verifyToken, checkRole | Returns all interviews for a student, sorted by date ascending. |
| GET | `/api/company/interviews/:companyId` | ✅ | company | verifyToken, checkRole | Returns all interviews for a company, sorted by date ascending. |

---

## Admin Routes

Mounted at: `app.use('/api/admin', adminRoutes)` in `server.js`

All admin routes apply `verifyToken` and `checkRole('admin')` to the entire router via `router.use()` — no need to repeat per route.

| Method | Route | Auth | Role | What It Does |
|---|---|---|---|---|
| GET | `/api/admin/stats` | ✅ | admin | Returns `{ students, companies, pendingCompanies, jobs }` count |
| GET | `/api/admin/students` | ✅ | admin | Returns all students (password excluded) |
| GET | `/api/admin/companies` | ✅ | admin | Returns all companies (password excluded) |
| GET | `/api/admin/jobs` | ✅ | admin | Returns all job postings |
| PUT | `/api/admin/companies/:companyId/verify` | ✅ | admin | Sets `isVerified: true` on a company |
| DELETE | `/api/admin/students/:studentId` | ✅ | admin | Hard-deletes a student document |
| DELETE | `/api/admin/companies/:companyId` | ✅ | admin | Hard-deletes a company document |
| DELETE | `/api/admin/jobs/:jobId` | ✅ | admin | Hard-deletes a job document |

---

## Error Response Structure

All error responses follow this shape:
```json
{ "message": "Human-readable error description" }
```

| Status Code | When It's Used |
|---|---|
| `200` | Success (also used for forgot-password to prevent enumeration) |
| `201` | Resource created (registration, job post, application, interview) |
| `400` | Bad request — validation error, duplicate email, already applied |
| `401` | Unauthorized — invalid credentials at login |
| `403` | Forbidden — missing/expired token, wrong role, unverified company, company doesn't own the resource |
| `404` | User not found at login, job not found, application not found |
| `500` | Internal server error — unexpected exception in try/catch |

---

## Static File Serving

Uploaded resume PDFs are accessible as static files:

```js
// server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

A resume uploaded for student ID `abc123` is accessible at:
```
http://localhost:3000/uploads/abc123-1704067200000-987654321.pdf
```

The `resumeUrl` stored in the student document is the full URL to this file.
