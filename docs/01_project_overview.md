# 01 — Project Overview

## Elevator Pitch

PlaceME is a full-stack MERN web application that automates campus placement processes for educational institutions. It connects students looking for jobs with companies recruiting talent, while giving an admin complete oversight of the platform — replacing messy spreadsheets and email chains with a single, role-aware dashboard system.

---

## The Problem It Solves

Traditional campus placement is painful:
- Students send resumes by email with no way to track what happened.
- Companies juggle hundreds of attachments with no central applicant view.
- Placement coordinators (admins) manually chase students and companies for updates.

PlaceME centralises everything: job postings, applications, status updates, interview scheduling, and resume uploads — all in one place, per role.

---

## Users and Their Roles

| Role | Who They Are | What They Can Do |
|------|-------------|------------------|
| **Student** | A college student seeking placement | Register, build a profile, upload a resume, browse and apply to jobs, track application status, view scheduled interviews |
| **Company** | A recruiter from a hiring company | Register (pending admin approval), post jobs, view and manage applicants per job, shortlist candidates, schedule interviews |
| **Admin** | Placement coordinator / institution admin | View platform-wide statistics, manage all students and companies, verify companies before they can log in, delete users or jobs |

---

## Full Feature List

### Student
- Register with academic details (education, skills, experience, contact)
- Login with JWT-based authentication
- Update profile at any time
- Upload a PDF resume (stored on the server, max 5 MB)
- Browse all active job postings with search (by title/skill) and location filters
- Apply to a job with one click (duplicate-apply prevention built in)
- View all personal applications with live status
- View upcoming scheduled interviews
- View public company profiles

### Company
- Register with company name and email
- Login only after admin verifies the account
- Post job openings with title, description, location, required skills, and deadline
- View all applications received across all posted jobs
- View applicants per job with student name, email, contact, and resume link
- Update any application's status (Applied → Shortlisted → Interview Scheduled → Hired / Rejected)
- Schedule interviews (Virtual / On-site / Phone) with date, time, and meeting link
- Edit posted jobs
- Edit company profile (website, description, logo URL)

### Admin
- Register (only one admin account allowed per platform)
- View platform statistics: total students, companies, pending verifications, job count
- View all students and companies
- Verify companies (enables their login)
- Delete students, companies, or job postings

### Platform-wide
- Password reset via email token (Nodemailer + Gmail)
- 404 page for unknown routes
- Protected routes — unauthenticated users are redirected to login
- Role-based route guards — companies cannot access student routes and vice versa

---

## Tech Stack

| Technology | Why It Was Chosen | Where It's Used |
|---|---|---|
| **React 19** | Component-based UI, fast re-renders with hooks, huge ecosystem | All frontend pages in `src/client/` |
| **React Router 7** | Declarative client-side routing with protected route support | `src/client/main.jsx` — all route definitions |
| **Axios** | Promise-based HTTP client, cleaner than fetch for error handling | Every page that makes API calls |
| **Node.js** | Non-blocking I/O, same language as frontend (JavaScript) | Backend runtime for the Express server |
| **Express 5** | Minimal, fast, unopinionated web framework; great middleware ecosystem | `src/server/server.js` — all routes and middleware |
| **MongoDB Atlas** | Flexible document store, great for varied user schemas, hosted cloud DB | Stores students, companies, jobs, applications, interviews |
| **Mongoose 8** | Schema validation, model abstraction, and query API on top of MongoDB | All models in `src/server/models/` |
| **JSON Web Tokens (JWT)** | Stateless auth — no session storage needed on the server | `authController.js` (generate), `authMiddleware.js` (verify) |
| **bcryptjs** | Industry-standard password hashing with salting | `authController.js` — all sign-up and password reset flows |
| **Multer 2** | Handles `multipart/form-data` for file uploads | `src/server/Routes/studentRoutes.js` — resume upload |
| **Nodemailer** | Sends transactional email (password reset links) | `authController.js` — `forgotPassword` function |
| **Joi** | Declarative request body validation, stops bad data at the route level | `src/server/Middleware/authValidation.js` |
| **dotenv** | Loads environment variables from `.env` file so secrets stay out of code | `src/server/server.js` — loaded at startup |
| **concurrently** | Runs frontend (Vite) and backend (nodemon) in a single terminal command | `package.json` — `npm run dev:all` |
| **Vite 7** | Extremely fast dev server with HMR; modern ES module bundler | `vite.config.js` — builds and serves the React app |
| **nodemon** | Auto-restarts the Node server on file changes during development | `package.json` `dev` script |

---

## Project Folder Structure

```
PlaceME/
│
├── docs/                          ← You are here — technical documentation
│
├── src/
│   ├── client/                    ← All React frontend code
│   │   ├── Components/
│   │   │   ├── ScheduleInterviewModal.jsx   ← Modal: company schedules interview
│   │   │   └── UpdateStatusModal.jsx        ← Modal: company updates app status
│   │   │
│   │   ├── Pages/
│   │   │   ├── home.jsx              ← Landing page (public)
│   │   │   ├── login.jsx             ← Login form (all roles)
│   │   │   ├── register.jsx          ← Role selector (Student / Company)
│   │   │   ├── studentRegister.jsx   ← Student registration form
│   │   │   ├── companyRegister.jsx   ← Company registration form
│   │   │   ├── AdminRegister.jsx     ← Admin registration form
│   │   │   ├── ForgotPassword.jsx    ← Request password reset by email
│   │   │   ├── ResetPassword.jsx     ← Set new password via token link
│   │   │   ├── NotFound.jsx          ← 404 page for unknown routes
│   │   │   │
│   │   │   ├── dashboard.jsx         ← Student home: stats + recent apps
│   │   │   ├── browseJobs.jsx        ← Student job search and apply
│   │   │   ├── updateProfile.jsx     ← Student profile editor + resume upload
│   │   │   ├── viewResume.jsx        ← Student view own profile/resume
│   │   │   ├── ViewAllApplications.jsx   ← Student full application history
│   │   │   │
│   │   │   ├── CompanyDashboard.jsx  ← Company home: post jobs, view apps
│   │   │   ├── ViewApplicants.jsx    ← Applicant list for one specific job
│   │   │   ├── EditJob.jsx           ← Edit an existing job posting
│   │   │   ├── EditCompanyProfile.jsx    ← Edit company details
│   │   │   ├── ViewCompanyProfile.jsx    ← Public company profile view
│   │   │   │
│   │   │   └── AdminDashboard.jsx    ← Admin: stats, manage users/jobs
│   │   │
│   │   ├── header.jsx               ← Shared top nav for all logged-in pages
│   │   ├── main.jsx                 ← React Router root — all route definitions
│   │   └── index.css                ← Global styles for all legacy CSS classes
│   │
│   └── server/                    ← All Express backend code
│       ├── Controllers/
│       │   ├── authController.js        ← Register, login, forgot/reset password
│       │   ├── studentController.js     ← Get/update profile, resume upload
│       │   ├── companyController.js     ← Get/update company profile
│       │   ├── jobController.js         ← Post, get, update jobs
│       │   ├── applicationController.js ← Apply, get, update application status
│       │   ├── interviewController.js   ← Schedule and get interviews
│       │   └── adminController.js       ← Stats, manage users, verify companies
│       │
│       ├── Middleware/
│       │   ├── authMiddleware.js    ← JWT verify + role check
│       │   └── authValidation.js   ← Joi schemas for all request bodies
│       │
│       ├── Routes/
│       │   ├── authRoutes.js        ← /api/login, /api/student-register, etc.
│       │   ├── studentRoutes.js     ← /api/student/profile/:id, upload-resume
│       │   ├── companyRoutes.js     ← /api/company/profile/:id
│       │   ├── jobRoutes.js         ← /api/jobs (CRUD)
│       │   ├── applicationRoutes.js ← /api/apply-job, /api/applications
│       │   ├── interviewRoutes.js   ← /api/interviews
│       │   └── adminRoutes.js       ← /api/admin/* (all admin operations)
│       │
│       ├── models/
│       │   ├── Student.js           ← Mongoose schema for students
│       │   ├── Company.js           ← Mongoose schema for companies
│       │   ├── Admin.js             ← Mongoose schema for admins
│       │   ├── jobSchema.js         ← Mongoose schema for job postings
│       │   ├── applicationSchema.js ← Mongoose schema for applications
│       │   ├── interviewSchema.js   ← Mongoose schema for interviews
│       │   └── PasswordResetToken.js← Temporary hashed token for password reset
│       │
│       ├── uploads/                 ← Resume PDFs stored here (git-ignored)
│       │   └── .gitkeep             ← Keeps the empty folder tracked in git
│       │
│       ├── db.js                    ← Connects to MongoDB Atlas via Mongoose
│       ├── server.js                ← Express app: middleware, routes, listen
│       ├── config.js                ← (Legacy) Static config object
│       └── .env                     ← Server secrets (git-ignored)
│
├── index.html                     ← Vite HTML entry point
├── vite.config.js                 ← Vite config with /api proxy to backend
├── package.json                   ← All dependencies + npm scripts
├── .gitignore                     ← Excludes node_modules, .env, uploads
└── README.md                      ← Setup and usage instructions
```
