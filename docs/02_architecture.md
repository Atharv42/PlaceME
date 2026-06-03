# 02 — Architecture

## How the Three Layers Connect

PlaceME follows a classic **three-tier architecture**:

1. **Frontend (React + Vite)** — runs in the browser at `http://localhost:5173`. Sends HTTP requests to the backend API.
2. **Backend (Express + Node.js)** — runs at `http://localhost:3000`. Receives requests, validates them, runs business logic, talks to the database, and sends back JSON.
3. **Database (MongoDB Atlas)** — a cloud-hosted MongoDB cluster. The backend connects to it via Mongoose when the server starts.

The frontend **never talks to the database directly**. All data access goes through the Express API.

---

## ASCII System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│                                                                 │
│  React App (Vite, port 5173)                                   │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │  React Pages │──▶│  React Router │──▶│  Axios HTTP call │  │
│  └──────────────┘   └───────────────┘   └────────┬─────────┘  │
└───────────────────────────────────────────────────┼────────────┘
                                                    │ /api/* (proxied by Vite)
                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER  (port 3000)                   │
│                                                                 │
│  ┌─────────────────┐   ┌────────────────┐   ┌───────────────┐ │
│  │  CORS + JSON    │──▶│  Joi Validation│──▶│  JWT Verify   │ │
│  │  Middleware     │   │  Middleware    │   │  Middleware   │ │
│  └─────────────────┘   └────────────────┘   └───────┬───────┘ │
│                                                      │         │
│  ┌───────────────────────────────────────────────────▼───────┐ │
│  │  Router layer (authRoutes, jobRoutes, studentRoutes, ...)  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │  Controller layer (authController, jobController, ...)   │  │
│  └──────────────────────────┬────────────────────────────┘  │  │
└───────────────────────────── │──────────────────────────────┘  
                               │ Mongoose queries
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MongoDB Atlas (Cloud)                        │
│                                                                  │
│  Collections: students · companies · admins · jobs ·            │
│               applications · interviews · passwordresettokens    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vite Dev Proxy

During development, all `/api/*` calls from the React app hit the Vite dev server first. Vite transparently forwards them to the Express backend:

```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000',
    '/uploads': 'http://localhost:3000',
  },
},
```

This means frontend code calls `/api/login` — not `http://localhost:3000/api/login` — making it environment-independent.

---

## Request Lifecycle: Student Clicks "Apply to Job"

Here is the exact sequence of events, tracing every file touched:

```
1. Student clicks "View Details & Apply" button
   File: src/client/Pages/browseJobs.jsx  →  handleApply(jobId)

2. Axios POST request sent
   POST /api/apply-job
   Body: { jobId, studentId }
   Headers: { Authorization: "Bearer <JWT>" }

3. Vite dev proxy forwards to http://localhost:3000/api/apply-job

4. Express receives the request in server.js
   File: src/server/server.js
   → app.use('/api', applicationRoutes)

5. Request hits the route handler
   File: src/server/Routes/applicationRoutes.js
   → router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob)

6. Middleware chain runs:
   a. verifyToken (src/server/Middleware/authMiddleware.js)
      → Reads Authorization header
      → Calls jwt.verify(token, process.env.JWT_SECRET)
      → Attaches decoded { id, email, role } to req.user
      → Calls next()

   b. checkRole('student') (src/server/Middleware/authMiddleware.js)
      → Checks req.user.role === 'student'
      → Calls next()

   c. ApplyJobValidation (src/server/Middleware/authValidation.js)
      → Joi schema: { jobId: string required, studentId: string required }
      → If invalid → 400 Bad Request
      → If valid → calls next()

7. Controller runs
   File: src/server/Controllers/applicationController.js  →  applyForJob()
   → Check if Application already exists: Application.findOne({ jobId, studentId })
   → If duplicate → 400 "You have already applied"
   → Check job exists: Job.findById(jobId)
   → Create new Application: { jobId, studentId, status: 'Applied', appliedDate: new Date() }
   → await newApplication.save()

8. Response sent back
   → 201 { message: 'Application submitted successfully!', application: {...} }

9. Axios receives the response in browseJobs.jsx
   → setAppliedJobIds(prevIds => new Set(prevIds).add(jobId))
   → setSuccessMessage(res.data.message)
   → Button text changes to "Applied" and is disabled
```

---

## MVC Pattern in This Project

PlaceME follows a loose **Model-View-Controller** pattern:

| Layer | In This Project | Files |
|-------|----------------|-------|
| **Model** | Mongoose schemas define the data shape and run validation at the DB level | `src/server/models/*.js` |
| **View** | React components render the UI based on state | `src/client/Pages/*.jsx`, `src/client/Components/*.jsx` |
| **Controller** | Express controller functions handle request logic, orchestrate DB calls, and form responses | `src/server/Controllers/*.js` |

The **Router** layer (`src/server/Routes/*.js`) sits between View and Controller — it maps HTTP methods + paths to the right controller function and applies middleware.

**Example:**
```
GET /api/student/profile/:studentId
       ↓
studentRoutes.js   → verifyToken → checkRole('student') → getStudentProfile
                                                                ↓
                                               studentController.js
                                               Student.findById(studentId)
                                                                ↓
                                               Student model (Mongoose)
                                                                ↓
                                               MongoDB Atlas
```

---

## Why MERN Over Alternatives

### REST API vs GraphQL
PlaceME uses REST. GraphQL would be useful if clients needed to fetch arbitrary combinations of data to avoid over-fetching — but in this project, every page has a well-defined, fixed data requirement (e.g. "give me all applications for this student"). REST endpoints are simpler to write, easier to understand, and don't require a separate query language to learn.

### MongoDB vs SQL (PostgreSQL/MySQL)
MongoDB was chosen because:
- The data models for different user types (students, companies, admins) have different shapes — MongoDB's flexible documents handle this naturally.
- No complex joins are needed. Applications reference job IDs and student IDs as strings and the controllers manually enrich data when needed.
- MongoDB Atlas offers free hosted cloud storage, which removes the need to run a local database server.
- Mongoose provides schema validation, so we get the safety of defined types without the rigidity of SQL migrations.

That said, there are tradeoffs (see `docs/10_improvements.md`).

### Express vs Alternatives (Fastify, NestJS)
Express was chosen because it is the most documented Node.js framework, familiar to most developers, and has minimal boilerplate. For a project of this scale, Express is more than sufficient.

---

## Environment Variables

Secrets and config are never hardcoded in source files. They live in `src/server/.env` which is loaded at startup:

```js
// src/server/server.js
dotenv.config({ path: path.join(__dirname, '.env') });
```

The file is excluded from Git via `.gitignore` (`.env.*` pattern). A developer cloning the project creates their own `.env` from the documented template in the README.

| Variable | What It Does |
|---|---|
| `MongoDB_URI` | Connection string for MongoDB Atlas |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens |
| `EMAIL_USER` | Gmail address used by Nodemailer to send reset emails |
| `EMAIL_PASS` | Gmail App Password (not account password) for Nodemailer |
| `PORT` | Port the Express server listens on (default 3000) |
| `API_URL` | Full URL of the backend — used when constructing resume file URLs |
| `CLIENT_URL` | Full URL of the frontend — used in password reset email links |

If `JWT_SECRET` is missing at login time, the server returns a 500 error rather than silently failing:

```js
// src/server/Controllers/authController.js
const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error("JWT_SECRET is not defined.");
    return res.status(500).json({ message: "Internal server configuration error." });
}
```
