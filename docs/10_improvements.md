# 10 — Improvements & Known Limitations

## Features That Could Be Added Next

### High Value (answer to "what would you add?")

| Feature | Why | How |
|---|---|---|
| **Real-time notifications** | Students currently have to refresh to see status updates | Socket.io — emit events from controllers when status changes; students join a room on login |
| **Refresh tokens** | 1-hour JWT expiry is jarring for active sessions | Issue a 7-day refresh token in an httpOnly cookie at login; add `POST /api/auth/refresh` endpoint |
| **Resume parsing** | Right now skills and experience are free text; hard to search | Use a PDF parsing library to extract text and auto-populate profile fields |
| **Email notifications** | Students should get an email when their status changes | Nodemailer is already configured — add `sendMail()` calls in `updateApplicationStatus()` |
| **Search and filter for admin** | Admin currently sees all students/companies in a flat list | Add `?search=`, `?verified=`, `?page=` query params to admin endpoints with text index on name/email |
| **Pagination** | All list endpoints return everything at once — bad at scale | Add `limit` and `skip` (or cursor-based) pagination to jobs, applications, students, companies endpoints |

---

### Medium Value

| Feature | Why | How |
|---|---|---|
| **Multiple admins** | One admin is a single point of failure | Add `isSuperAdmin` field; allow super admin to invite additional admins via email |
| **Company dashboard analytics** | Companies want to know how many views a job got | Track `viewCount` on job documents; increment in `getAllJobs` when a student fetches them |
| **Interview rescheduling** | Currently no way to update or delete a scheduled interview | Add `PUT /api/interviews/:id` and `DELETE /api/interviews/:id` endpoints |
| **Application withdrawal** | Students have no way to cancel an application | Add `DELETE /api/applications/:applicationId` endpoint with student role check |
| **Bulk actions for admin** | Deleting users one at a time is slow | Add `POST /api/admin/bulk-delete` with an array of IDs |
| **Dark mode** | Nice-to-have UI feature | CSS custom properties (`--bg-color`, `--text-color`) toggled by a class on `<html>` |

---

### Resume-Impressive Additions

| Feature | Description |
|---|---|
| **TypeScript** | Add type safety across both frontend and backend — catches bugs at compile time |
| **Unit tests** | Jest + Supertest for API endpoints; React Testing Library for components |
| **CI/CD pipeline** | GitHub Actions to run tests and auto-deploy to Render/Vercel on push to main |
| **API rate limiting** | `express-rate-limit` on login and registration endpoints — prevents brute force |
| **Swagger docs** | Auto-generate API documentation from JSDoc comments |
| **Docker** | `Dockerfile` + `docker-compose.yml` for one-command local setup |

---

## Known Limitations of the Current Implementation

### 1. No Cascade Deletes
When an admin deletes a student, their applications and interviews remain in the database as orphaned documents. The same applies when deleting a company — its jobs and associated applications are not cleaned up.

**Fix:** Add pre-delete hooks in Mongoose:
```js
// Before deleting a student, delete their applications
studentSchema.pre('findOneAndDelete', async function(next) {
    const studentId = this.getQuery()._id;
    await Application.deleteMany({ studentId: studentId.toString() });
    next();
});
```

---

### 2. IDs Stored as Strings, Not ObjectIds
`jobId`, `studentId`, `companyId` in Application and Interview schemas are plain `String` types, not `mongoose.Schema.Types.ObjectId`. This means:
- `populate()` cannot be used for automatic joins
- Index performance on string fields is slightly worse than ObjectId
- Cross-collection consistency is application-level only

**Fix:** Change to ObjectId refs with proper Mongoose `ref` declarations.

---

### 3. N+1 Query Problem in Application Enrichment
In `getCompanyApplications()`, the code fetches all applications, then for each application individually fetches the student:
```js
await Promise.all(applications.map(async (app) => {
    const student = await Student.findById(app.studentId); // one query per application
    ...
}));
```
With 100 applications, this runs 100 separate database queries.

**Fix:** Collect all unique studentIds, fetch them in a single `Student.find({ _id: { $in: studentIds } })` call, then build a lookup map.

---

### 4. No Input Sanitization
Joi validates the shape and format of inputs (type, length, pattern) but doesn't sanitize them. For example, a student could set their `skills` field to a very long string with special characters.

**Fix:** Add `.trim()` to string validators in the Joi schemas, and set `maxLength` for all free-text fields.

---

### 5. localStorage for Auth State
Using localStorage to store the JWT means:
- XSS attacks (though currently none exist) could read the token
- There's no way to invalidate the token on the server side before it expires (e.g., on logout, we just delete from localStorage — but the token itself is still valid)

**Fix:** Store the access token in memory (React Context/state) and use an httpOnly cookie for the refresh token.

---

### 6. Password Reset Doesn't Invalidate Active Sessions
When a user resets their password, any currently active JWTs remain valid until they expire (up to 1 hour). During that hour, an attacker who had the old token can still make API calls.

**Fix:** Implement a JWT blacklist (Redis) or version tokens with a `tokenVersion` field on the user — increment it on password reset, and reject tokens with an older version.

---

### 7. `company` Name on Jobs Is Denormalized
When a company registers, their email is used as the display name (from `localStorage.getItem('email')`):
```js
// CompanyDashboard.jsx
setCompanyName(email || 'My Company');
// ...
company: companyName  // this gets saved to the job
```
If the company later updates their `companyName` in their profile, existing jobs still show the old name.

**Fix:** Store `companyId` (already stored) and fetch the company name dynamically, or add a `PUT /api/jobs/company/:companyId/update-names` endpoint to refresh denormalized fields.

---

## What I Would Do Differently If Starting From Scratch

### 1. Use TypeScript from Day One
Type errors in this project are silent — passing the wrong shape to an API call only fails at runtime. TypeScript would catch these at compile time and make the codebase much easier to maintain.

### 2. Use ObjectId References Properly
I'd define all cross-collection references as `mongoose.Schema.Types.ObjectId` with `ref` fields from the start. This enables `populate()`, makes queries more efficient, and aligns with Mongoose best practices.

### 3. Centralized Axios Instance
Instead of manually attaching the auth header in every single API call, I'd create one Axios instance with an interceptor:
```js
// src/client/api.js
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```
This is 2 lines in one file instead of repeating `headers: { Authorization: \`Bearer ${token}\` }` in 18 components.

### 4. React Context for Auth
I'd create an `AuthContext` that provides `{ user, login, logout }` to all components. This replaces direct `localStorage.getItem()` calls scattered throughout pages and makes the auth state reactive — if you call `logout()`, every subscribed component immediately knows.

### 5. Express Error Handling Middleware
Instead of a try/catch in every controller, I'd use a global error handler and `express-async-errors`:
```js
// At the end of server.js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});
```

### 6. More Granular Status History
Right now, `application.status` is just a string that gets overwritten. A recruiter can't see that an application went `Applied → Shortlisted → Rejected`. I'd store an array of `{ status, changedAt, changedBy }` objects to maintain a full audit trail.

---

## How to Make This Production-Grade at Scale

| Concern | Current State | Production Solution |
|---|---|---|
| **Authentication** | JWT in localStorage, 1h expiry | Refresh tokens in httpOnly cookies, token rotation |
| **File Storage** | Local disk (`src/server/uploads/`) | AWS S3 or Cloudinary — survives server restarts, scales horizontally |
| **Database** | No connection pooling config | Mongoose connection pool settings, read replicas for heavy read loads |
| **Caching** | No caching | Redis for job listings (TTL 5 min), dashboard stats (TTL 30 sec) |
| **Security** | No rate limiting | `express-rate-limit` on auth routes, Helmet.js for security headers |
| **Logging** | `console.error` | Winston or Pino with structured JSON logs, forwarded to Datadog or Sentry |
| **Monitoring** | None | Uptime monitoring (Better Uptime), error tracking (Sentry), metrics (Prometheus) |
| **CI/CD** | Manual deploy | GitHub Actions: test → lint → build → deploy on merge to main |
| **Secrets Management** | `.env` file | AWS Secrets Manager or HashiCorp Vault |
| **Load Balancing** | Single server instance | Multiple instances behind a load balancer (AWS ALB or nginx) |
