# 08 — Interview Questions & Answers

All answers reference real code from this project. Speak confidently using "I" and "my project."

---

## Section 1: General / HR Questions

**Q1: Tell me about PlaceME in 60 seconds.**

"PlaceME is a full-stack MERN web application I built to automate campus placement management. The core problem I was solving is that most college placement cells still use spreadsheets and email threads — which are slow, error-prone, and hard to track. My app replaces that with a structured platform where students can browse jobs and apply, companies can post openings and manage applicants, and an admin can oversee everything from one dashboard. I built three separate role-based interfaces with JWT authentication, protected routes, file uploads for resumes, and email-based password reset — it's a complete end-to-end system."

---

**Q2: What was the most challenging part of building this?**

"The most technically interesting challenge was implementing the role-based authentication system correctly at multiple layers. I had three completely different user types — Student, Company, and Admin — stored in three separate MongoDB collections. At login, my controller has to search all three collections in order to find the user:
```js
user = await Admin.findOne({ adminEmail: email });
if (!user) user = await Student.findOne({ email });
if (!user) user = await Company.findOne({ companyEmail: email });
```
Then I had to ensure that after login, a company couldn't access student API routes. I handled this at both the backend (JWT + `checkRole` middleware) and frontend (`PrivateRoute` component). Getting that double-layered protection right — and handling edge cases like expired tokens, unverified companies, and the one-admin-per-platform rule — took the most careful thinking."

---

**Q3: What would you improve if you had more time?**

"A few things stand out:
1. **Real-time notifications** — right now, students have to refresh the page to see a new status update. I'd add WebSocket support with Socket.io so they get live updates.
2. **Proper TypeScript** — I'd add TypeScript to catch type errors at development time, especially for the API response shapes that are manually passed around.
3. **Compound indexes in MongoDB** — I'm querying Applications by both `studentId` and `jobId` frequently, but I haven't added compound indexes for those fields. At 10,000+ applications, that would become noticeable.
4. **Refresh tokens** — my JWTs expire after one hour. I'd add a refresh token system so users don't get logged out in the middle of a session."

---

**Q4: Why did you choose the MERN stack?**

"I chose MERN because it lets me write JavaScript end-to-end — one language for both frontend and backend, which reduces context-switching and makes it easier to share data shapes between layers. MongoDB was a good fit because my three user types (Student, Company, Admin) have different schemas, and a relational database would require complex table structures or multiple inheritance patterns. React's component model worked well for building three completely separate dashboards that share a common auth layer. And Express gave me the flexibility to structure my API exactly how I wanted, with custom middleware chains."

---

**Q5: How long did it take to build?**

"I built it over [your actual timeframe]. I started by designing the database schemas and the API contract first — I mapped out all the endpoints before writing a single line of frontend code. That upfront planning saved a lot of rework. The auth system and JWT middleware were the first pieces I implemented because everything else depended on them."

---

## Section 2: React Questions

**Q6: How does state management work in your app?**

"I use local component state with React hooks throughout — no Redux or Context API. Each page manages its own `loading`, `error`, `data` states with `useState`, and fetches data in a `useEffect` on mount. The one piece of 'global' state is the auth info — token, role, userId, email — which I store in `localStorage`. Any component can read from localStorage directly, which acts as a simple global store. The tradeoff is that if I update user info somewhere, I have to remember to also update localStorage and re-fetch. For a project this size, it works fine, but for a larger app I'd use React Context to wrap the auth state."

---

**Q7: Explain how protected routes are implemented.**

"I have a `PrivateRoute` component in `main.jsx` that wraps every authenticated route:
```jsx
const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
    return children;
};
```
If there's no token, the user is sent to `/login`. If there is a token but the role doesn't match (e.g., a student trying to access `/company-dashboard`), they're sent to the home page. On top of that, each dashboard page also checks the role itself in a `useEffect`, so even if someone bypasses the router, the API call will fail because the JWT's role won't match the backend's `checkRole` middleware."

---

**Q8: How do you handle API errors in the frontend?**

"Every page wraps its API calls in try/catch blocks. In the catch block, I check if the error has a response from the backend:
```js
} catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);  // show the backend's message
    } else {
        setError('Failed to fetch. Please try again.');  // generic fallback
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');  // expired token → force logout
    }
}
```
The error message is displayed in the JSX with a `.login-error` class div. This means users always see a human-readable message, not a raw JavaScript error."

---

**Q9: What is the component lifecycle and where did you use useEffect?**

"In React functional components, `useEffect` replaces the old lifecycle methods. I use it for data fetching — it runs after the component mounts, which is the right time to make API calls. For example, in `dashboard.jsx`:
```js
useEffect(() => {
    const fetchStudentData = async () => {
        // fetch applications and interviews
    };
    fetchStudentData();
}, [navigate]);
```
The `[navigate]` dependency array means this runs once on mount (navigate is stable). I also use `useEffect` in `EditJob.jsx` with `[jobId, navigate]` — it re-fetches if the jobId in the URL changes. And in `ScheduleInterviewModal.jsx`, I use `useEffect` to reset the form state whenever the modal is opened with a new application:
```js
useEffect(() => {
    setInterviewData({ date: today, time: '10:00', type: 'Virtual', link: '' });
}, [applicationId, studentId]);
```"

---

**Q10: How did you handle the file upload in React?**

"File uploads use the `FormData` API, not JSON. In `updateProfile.jsx`:
```js
const uploadFormData = new FormData();
uploadFormData.append('resume', selectedFile);  // 'resume' matches multer's field name

await axios.post(
    `/api/student/profile/${studentId}/upload-resume`,
    uploadFormData,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
);
```
I also validate the file on the frontend before uploading — checking for `application/pdf` MIME type and 5MB size limit — so we give immediate feedback without making a server round-trip for obviously wrong files."

---

## Section 3: Node.js / Express Questions

**Q11: How is your Express server structured?**

"My server has three layers. First, `server.js` sets up the Express app, loads environment variables, applies global middleware (CORS, JSON parsing, static file serving), mounts all the route files, and starts listening. Second, the Route files (`authRoutes.js`, `jobRoutes.js`, etc.) define which HTTP methods and paths map to which controllers, and apply middleware per-route. Third, the Controller files contain the actual business logic — they talk to Mongoose models and send back responses. Here's an example chain:
```
POST /api/apply-job
  → applicationRoutes.js defines: router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob)
  → authMiddleware.js: verifyToken, checkRole
  → authValidation.js: ApplyJobValidation (Joi)
  → applicationController.js: applyForJob()
```"

---

**Q12: How does middleware work and what custom middleware did you write?**

"Middleware in Express is any function with the signature `(req, res, next)`. It runs before the final route handler, can modify the request, and calls `next()` to pass control forward. I wrote two custom middleware files: `authMiddleware.js` and `authValidation.js`. The auth middleware has `verifyToken` — which reads the Bearer token, calls `jwt.verify()`, and attaches `req.user` — and `checkRole(role)` — which is a higher-order function that returns a middleware checking `req.user.role`. The validation middleware uses Joi schemas to validate request bodies. If validation fails, it returns `400` without reaching the controller. All errors short-circuit by returning a response instead of calling `next()`."

---

**Q13: How do you handle async errors in controllers?**

"Every controller function is `async` and wrapped in a `try/catch` block. The catch block logs the error with `console.error` and sends a `500` response. There's no global error handler middleware in this project — each controller handles its own errors locally. For example:
```js
const applyForJob = async (req, res) => {
    try {
        // business logic
        res.status(201).json({ ... });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Internal server error while submitting application.' });
    }
};
```
For production, I'd add an Express error-handling middleware (`(err, req, res, next)`) to centralize this, and use a package like `express-async-errors` to auto-catch errors from async functions."

---

**Q14: What is the difference between authentication and authorization?**

"Authentication answers 'who are you?' — it's the login process where we verify your identity by checking your password against the stored hash. Authorization answers 'what are you allowed to do?' — it's checking your role after you're already authenticated. In my code, `verifyToken` does authentication — it verifies the JWT signature and extracts your identity. `checkRole('company')` does authorization — it checks that your identity has the required role for this action. A student with a valid token is authenticated but not authorized to access company routes."

---

**Q15: Why did you use `bcryptjs` instead of the native `crypto` module for passwords?**

"The native `crypto` module in Node.js has SHA/MD5 hashing, but those are fast hash functions — they can be brute-forced quickly with modern GPUs. bcrypt is specifically designed to be slow. The cost factor (`10` in `bcrypt.hash(password, 10)`) means it runs 2^10 = 1024 rounds, making it exponentially harder to crack. bcrypt also automatically generates and embeds a random salt per hash, so even if two users have the same password, their hashes look completely different. This prevents rainbow table attacks."

---

## Section 4: MongoDB / Mongoose Questions

**Q16: Explain your database schema design decisions.**

"I have seven Mongoose schemas. The main design decision I made was to store user types in separate collections (students, companies, admins) rather than a single `users` collection with a `type` field. This keeps schemas clean and avoids a lot of optional fields. The tradeoff is that login has to search three collections. For job relationships, I store `companyId` as a plain string (the MongoDB ObjectId value) rather than a Mongoose `ObjectId` reference field. This means I can't use `populate()` for joins, but it simplified the early development. I also denormalize some data — storing `company` name directly on the job document and `jobTitle`/`companyName` on the interview document — so I don't need extra queries to display those fields in lists."

---

**Q17: What is populate() and where did you use it?**

"`populate()` is Mongoose's way to replace a reference field with the actual document from another collection — similar to a SQL JOIN. You declare the field as `type: mongoose.Schema.Types.ObjectId, ref: 'ModelName'` in your schema, then call `.populate('fieldName')` on a query and Mongoose fetches the referenced document automatically. In my project, the `PasswordResetToken` schema uses `refPath` (a polymorphic version) — `userId` is an ObjectId that could reference Student, Company, or Admin depending on the `userModel` field. For the other relationships (jobs → companies, applications → students), I store IDs as plain strings so I perform manual enrichment in the controllers instead."

---

**Q18: How would you optimize this database for 10,000 students?**

"The main optimization would be compound indexes on the `Application` collection, since it's the most-queried. Right now I query `{ studentId }` to get a student's applications and `{ jobId }` to get applications per job. I'd add:
```js
applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ jobId: 1 });
```
I'd also change the `jobId` and `studentId` fields from Strings to proper `ObjectId` references, which enables Mongoose `populate()` and works better with MongoDB's index optimizer. For the jobs collection, a text index on `title` and `description` would make the search feature faster than regex:
```js
jobSchema.index({ title: 'text', description: 'text' });
```
And I'd implement pagination for the admin's student/company lists instead of fetching all documents at once."

---

**Q19: Why did you use MongoDB instead of PostgreSQL?**

"For this use case, MongoDB worked well for three reasons: flexible schemas (student, company, and admin have different shapes so document storage is natural), no complex relational queries needed (most reads are simple find-by-id or find-by-companyId), and MongoDB Atlas provides a generous free tier that made deployment easy. PostgreSQL would give me stronger data integrity with foreign key constraints and would be better if I needed complex aggregations, but for a campus placement portal with mostly CRUD operations, MongoDB was a practical and fast choice."

---

## Section 5: Security Questions

**Q20: How do you store passwords?**

"I never store plaintext passwords. At registration, I hash the password with bcrypt:
```js
const hashedPassword = await bcrypt.hash(password, 10);
```
bcrypt generates a unique salt automatically, combines it with the password, runs it through 1024 rounds of hashing, and returns a string like `$2b$10$...` that embeds both the salt and the hash. At login, `bcrypt.compare(inputPassword, storedHash)` extracts the salt from the stored hash, re-hashes the input the same way, and compares — so we never need to store the salt separately."

---

**Q21: How does JWT work and is it secure?**

"A JWT has three parts: a header with the algorithm, a payload with user data (id, email, role, expiry), and a signature. The signature is `HMACSHA256(header + '.' + payload, JWT_SECRET)`. Anyone can decode the header and payload — they're just Base64 encoded, not encrypted. But they can't forge or modify the token without knowing the secret key, because the signature would no longer match. My tokens expire in one hour (`expiresIn: '1h'`), which limits the damage if a token is stolen. The weakness of JWT is that there's no way to invalidate a token before it expires — I address this limitation in `docs/10_improvements.md` with a refresh token + blacklist approach."

---

**Q22: What attacks is your app vulnerable to and how did you mitigate them?**

"Vulnerabilities I'm aware of and mitigations:
- **Brute force on login**: I don't have rate limiting yet. I'd add `express-rate-limit` middleware. *(Open vulnerability)*
- **SQL/NoSQL injection**: Mongoose's `findOne({ email: req.body.email })` escapes the input safely. Joi validation also rejects unexpected field types.
- **XSS**: React automatically escapes output in JSX. No `dangerouslySetInnerHTML` is used.
- **CSRF**: Not implemented, but since I use JWT in Authorization headers (not cookies), CSRF attacks are naturally mitigated — CSRF only works when auth is in cookies.
- **Sensitive data in token**: The JWT payload contains id, email, and role — no passwords or sensitive data.
- **File upload attacks**: Multer validates MIME type and limits file size. Only PDF files are accepted."

---

**Q23: How would you add refresh tokens?**

"The flow would be: at login, issue two tokens — a short-lived access token (15 minutes) and a long-lived refresh token (7 days). Store the refresh token in an `httpOnly` cookie (inaccessible to JavaScript). When the access token expires, the frontend automatically calls `POST /api/refresh` — the server verifies the refresh token cookie, checks a server-side token store (Redis or a DB collection) to ensure it hasn't been revoked, and issues a new access token. On logout, delete the refresh token from both the cookie and the server-side store. This is what I'd do in a production version of this app."

---

## Section 6: System Design Questions

**Q24: How would you scale this app to 100 colleges?**

"A few changes:
1. **Multi-tenancy** — Add a `collegeId` field to Student, Company, Job, and Application schemas so data is partitioned per institution. Students only see jobs from their college's companies.
2. **Caching** — Use Redis to cache frequently-read data like job listings (they don't change every second) and dashboard stats.
3. **Horizontal scaling** — Put the Express server behind a load balancer. Since JWT auth is stateless, any server can handle any request.
4. **File storage** — Move resumes from the local filesystem to AWS S3 or similar, so uploaded files are accessible from any server instance.
5. **Database indexes** — Add the compound indexes mentioned earlier to handle larger data volumes."

---

**Q25: How would you add real-time notifications?**

"I'd use Socket.io alongside Express. When a company updates an application status, the controller would emit a socket event:
```js
// In updateApplicationStatus controller
await application.save();
io.to(`student_${application.studentId}`).emit('status_updated', { applicationId, newStatus });
```
Students would join a personal room on login (`socket.join('student_' + userId)`). The React frontend would listen for the event and update the application list live without a page refresh. For the admin dashboard, I'd emit aggregate stats updates whenever a new student registers or a job is posted."

---

**Q26: How would you add a payment gateway for premium company accounts?**

"I'd integrate Stripe. The flow: admin marks a company plan as 'premium'; the company is redirected to a Stripe-hosted checkout session created by a new backend endpoint (`POST /api/payment/create-checkout`). After payment, Stripe sends a webhook to my backend (`POST /api/payment/webhook`). The webhook handler verifies the Stripe signature, finds the company document, and sets `isPremium: true`. The company schema would get a new `isPremium` field and `premiumExpiry` date. Premium companies could get benefits like featured job listings or higher applicant limits."

---

**Q27: What would you change if this went to production tomorrow?**

"Several things:
1. **Rate limiting** — Add `express-rate-limit` to prevent brute force on login and registration.
2. **HTTPS** — Deploy behind a reverse proxy (nginx) with SSL certificates via Let's Encrypt.
3. **Environment validation** — Add a startup check that fails fast if any required env var is missing, rather than failing at runtime when a user tries to log in.
4. **File storage** — Move from local disk to S3 or Cloudinary so resumes aren't lost if the server restarts.
5. **Structured logging** — Replace `console.error` with a proper logger like Winston or Pino that includes timestamps and log levels.
6. **Pagination** — Add limit/offset or cursor-based pagination to all list endpoints that could return large datasets.
7. **Cascade deletes** — Right now, deleting a student doesn't delete their applications or interviews. This would be important to fix."

---

**Q28: Explain the request lifecycle when the JWT secret is wrong.**

"If `JWT_SECRET` in the server's `.env` doesn't match the secret used to sign the token (for example, after rotating the secret), `jwt.verify()` throws a `JsonWebTokenError`. My `verifyToken` middleware catches it:
```js
} catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
}
```
All previously issued tokens instantly become invalid. The frontend receives 403, the `navigate('/login')` catch kicks in, and the user is forced to log in again. This is actually a way to 'log out all users at once' — rotate the secret in `.env` and restart the server."

---

**Q29: What's the difference between 401 and 403 in your API?**

"I use them for slightly different situations: `401 Unauthorized` is for failed login credentials — 'I don't know who you are.' `403 Forbidden` is for token issues or wrong role — 'I know who you are, but you're not allowed to do this.' For example:
- `401`: `bcrypt.compare()` returns false at login → wrong password
- `403`: `jwt.verify()` throws → expired or tampered token
- `403`: `checkRole('company')` fails → student trying to access company routes
- `403`: Company `isVerified === false` → registered but not approved yet"

---

**Q30: Why don't you use Mongoose populate() for applications?**

"When I designed the schemas, I stored `jobId` and `studentId` as plain `String` types rather than `mongoose.Schema.Types.ObjectId`. Mongoose's `populate()` only works with ObjectId references. I made this choice early on to keep things simple — string comparison is straightforward and doesn't require thinking about ObjectId casting. The tradeoff is that I have to manually enrich data in the controllers using `Promise.all` to fetch related documents. If I were refactoring, I'd switch those fields to proper `ObjectId` refs so I could use `populate()` and write cleaner query code."

---

**Q31: What does the `refPath` in PasswordResetToken do?**

"It's Mongoose's polymorphic reference feature. Instead of pointing to one specific model, `userId` can reference documents in different collections depending on the value of `userModel`:
```js
userId:    { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
userModel: { type: String, enum: ['Student', 'Company', 'Admin'] }
```
So if `userModel` is `'Student'`, `populate('userId')` fetches from the `students` collection. If it's `'Company'`, it fetches from `companies`. This lets one reset token schema serve all three user types without three separate token collections."

---

**Q32: How does the search feature work in job listings?**

"In `browseJobs.jsx`, the search inputs are stored in state and passed as query parameters:
```js
const params = {};
if (filters.search) params.search = filters.search;
if (filters.location) params.location = filters.location;
await axios.get('/api/jobs', { headers, params });
```
On the backend in `jobController.js`, `getAllJobs()` builds a MongoDB query dynamically:
```js
if (search) {
    query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skillsRequired: { $regex: search, $options: 'i' } }
    ];
}
if (location) {
    query.location = { $regex: location, $options: 'i' };
}
const jobs = await Job.find(query);
```
`$regex` with `$options: 'i'` makes it case-insensitive. `$or` means a job matches if either its title or its skills list contains the search term."

---

**Q33: Why is there a single Admin account limit?**

"It's a deliberate design choice for simplicity. A college would have one placement coordinator as the system administrator. I enforce this in `AdminSignUp()`:
```js
const adminCount = await Admin.countDocuments();
if (adminCount > 0) {
    return res.status(403).json({ message: "An admin account already exists." });
}
```
If you need multiple admins, you'd extend the model with an `isSuperAdmin` flag and allow the super admin to invite others. That's noted in `docs/10_improvements.md`."

---

**Q34: How do you prevent a company from modifying another company's job?**

"In the job controller, after finding the job by ID, I compare the job's `companyId` with the ID from the JWT:
```js
const { id: companyId } = req.user;  // from the verified JWT
const job = await Job.findById(jobId);
if (job.companyId !== companyId) {
    return res.status(403).json({ message: 'Access denied. You do not own this job.' });
}
```
This runs in `getJobDetails()`, `updateJob()`, and `getApplicationsForJob()`. Even if someone has a valid company JWT, they can't edit another company's jobs because the IDs won't match."

---

**Q35: What is the interview scheduling flow?**

"When a company updates an application status to 'Interview Scheduled' in `CompanyDashboard.jsx`, two things happen: the API call updates the status, and then the frontend automatically opens the `ScheduleInterviewModal`. The modal collects date, time, interview type (Virtual/On-site/Phone), and a meeting link for virtual interviews. On submit, it calls `POST /api/interviews`. The backend validates with Joi (including that the link is required for Virtual type) and saves an Interview document. The student's dashboard then shows the upcoming interview in the 'Your Upcoming Interviews' section, and if it's virtual, shows a 'Join Meeting' link that opens `interview.link` in a new tab."

---

**Q36: How is the password reset email sent securely?**

"I use Nodemailer with a Gmail account configured via environment variables. The process is:
1. Generate a random token: `crypto.randomBytes(32).toString('hex')` — this is the raw token that goes in the URL
2. Hash it: `crypto.createHash('sha256').update(resetToken).digest('hex')` — only the hash is stored in the database
3. Store the hash with a 15-minute expiry in `PasswordResetToken` collection
4. Email the raw token to the user in a link: `${CLIENT_URL}/reset-password/${rawToken}`
5. When the user clicks the link, `ResetPassword.jsx` posts the raw token to the API
6. The API hashes the received token and looks it up in the database — if found and not expired, the password is reset and the token is deleted

This way, even if someone reads the database, they only see SHA-256 hashes, not usable reset tokens."

---

**Q37: What happens if two students apply to the same job simultaneously?**

"MongoDB operations are not atomic across documents by default, but `Application.findOne({ jobId, studentId })` checks are per-student-per-job combination. Since `studentId` is the current user's ID (from their JWT), two different students applying simultaneously would each check their own studentId — no conflict. If the same student double-clicks the Apply button, the second request would find the first application already created and return `400 'You have already applied'`. The frontend also immediately adds the jobId to the `appliedJobIds` Set, disabling the button — so the double-click scenario is prevented on the frontend too."
