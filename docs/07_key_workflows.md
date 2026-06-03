# 07 — Key Workflows

## Workflow 1: Student Registration → Login → Browse Jobs → Apply

### Step 1: Student Registration

**File touched:** `src/client/Pages/studentRegister.jsx`

Student fills the form and clicks Register. The submit handler:
```js
// studentRegister.jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    await axios.post("/api/student-register", {
        firstName, lastName, email, password, contact, address, education, skills, experience
    });
    navigate("/login", { state: { successMessage: "Registration successful! Please log in." } });
};
```

**Files touched on the backend:**
1. `src/server/Routes/authRoutes.js` → routes to `StudentSignup` (Joi) then `StudentSignUp` (controller)
2. `src/server/Middleware/authValidation.js` → `StudentSignup` Joi schema validates all fields
3. `src/server/Controllers/authController.js` → `StudentSignUp()`:
   - Checks for duplicate email with `Student.findOne({ email })`
   - Hashes password: `bcrypt.hash(password, 10)`
   - Saves: `await newStudent.save()`
4. `src/server/models/Student.js` → Mongoose saves to `students` collection in MongoDB

---

### Step 2: Login

**File touched:** `src/client/Pages/login.jsx`

On success, the login response is stored to localStorage:
```js
localStorage.setItem("token", token);
localStorage.setItem("role", role);       // "student"
localStorage.setItem("userId", userId);
localStorage.setItem("email", email);
navigate("/dashboard");
```

**Backend files:**
1. `authRoutes.js` → `LoginValidation` → `Login`
2. `authController.js` → `Login()`:
   - Searches Admin → Student → Company collections in order
   - `bcrypt.compare(password, hashed)` verifies the password
   - `jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '1h' })` creates the token
3. Token is returned in the response body (not a cookie)

---

### Step 3: Browse Jobs

**File touched:** `src/client/Pages/browseJobs.jsx`

On mount, `fetchJobsAndApps()` runs:
```js
// 1. Fetch all jobs (with optional filters)
const jobsRes = await axios.get('/api/jobs', {
    headers: { Authorization: `Bearer ${token}` },
    params: { search: filters.search, location: filters.location }
});

// 2. Fetch which jobs this student already applied to
const appsRes = await axios.get(`/api/student/applications/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
const appliedIds = new Set(appsRes.data.applications.map(app => app.jobId));
setAppliedJobIds(appliedIds);
```

**Backend files:**
1. `jobRoutes.js` → `verifyToken` → `checkRole('student')` → `getAllJobs`
2. `jobController.js` → `getAllJobs()`:
   ```js
   let query = {};
   if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { skillsRequired: { $regex: search, $options: 'i' } }];
   if (location) query.location = { $regex: location, $options: 'i' };
   const jobs = await Job.find(query);
   ```

The `Set` of applied job IDs prevents the student from seeing an "Apply" button for already-applied jobs.

---

### Step 4: Apply to a Job

**File touched:** `src/client/Pages/browseJobs.jsx` → `handleApply(jobId)`

```js
const handleApply = async (jobId) => {
    const res = await axios.post('/api/apply-job', { jobId, studentId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    setSuccessMessage(res.data.message);
    setAppliedJobIds(prevIds => new Set(prevIds).add(jobId)); // disable button immediately
};
```

**Backend files:**
1. `applicationRoutes.js` → `verifyToken` → `checkRole('student')` → `ApplyJobValidation` → `applyForJob`
2. `applicationController.js` → `applyForJob()`:
   ```js
   const existingApplication = await Application.findOne({ jobId, studentId });
   if (existingApplication) return res.status(400).json({ message: 'You have already applied' });
   const jobExists = await Job.findById(jobId);
   if (!jobExists) return res.status(404).json({ message: 'Job not found' });
   await new Application({ jobId, studentId, status: 'Applied', appliedDate: new Date() }).save();
   ```

---

## Workflow 2: Company Registration → Login → Post Job → View Applicants → Shortlist

### Company Registration

**File:** `companyRegister.jsx`

Company submits name, email, password. The controller (`CompanySignUp`) saves with `isVerified: false`. The company **cannot log in** until an admin verifies them.

---

### Company Login

Works identically to student login but finds the user in the `companies` collection. The controller checks `isVerified` before issuing a token:
```js
if (userType === 'company' && !user.isVerified) {
    return res.status(403).json({ message: "Company account not verified by admin." });
}
```

---

### Post a Job

**File:** `src/client/Pages/CompanyDashboard.jsx` → `handlePostJob()`

```js
const jobData = {
    companyId,
    title: newJob.title,
    description: newJob.description,
    location: newJob.location,
    skillsRequired: newJob.skillsRequired.split(',').map(skill => skill.trim()), // string → array
    deadline: new Date(newJob.deadline).toISOString(),
    postedDate: new Date().toISOString(),
    company: companyName,  // email stored as display name
};
await axios.post('/api/jobs', jobData, { headers: { Authorization: `Bearer ${token}` } });
await fetchCompanyData(); // refresh to show new job
```

**Backend:** `jobRoutes.js` → `JobPostingValidation` (Joi checks deadline > now) → `jobController.js` → `postJob()` → saves to `jobs` collection.

---

### View Applicants

Company navigates to `/jobs/:jobId/applicants` → `ViewApplicants.jsx`.

```js
// ViewApplicants.jsx
const res = await axios.get(`/api/jobs/${jobId}/applications`, {
    headers: { Authorization: `Bearer ${token}` }
});
setApplications(res.data.applications);  // pre-enriched with student details
setJobTitle(res.data.jobTitle);
```

**Backend:** `applicationController.js` → `getApplicationsForJob()`:
1. Verifies the requesting company owns this job: `job.companyId !== companyId → 403`
2. Fetches all applications for this job
3. Enriches each with student data:
   ```js
   const student = await Student.findById(app.studentId).select('-password');
   return { ...app, studentName: `${student.firstName} ${student.lastName}`, studentEmail: ..., studentResumeUrl: ... };
   ```

---

### Shortlist a Candidate

**File:** `CompanyDashboard.jsx` → `handleSaveStatus(newStatus)` (via `UpdateStatusModal`)

```js
await axios.put(`/api/applications/${applicationId}/status`, { status: newStatus }, {
    headers: { Authorization: `Bearer ${token}` }
});
// If status is "Interview Scheduled", open the interview modal
if (newStatus.toLowerCase() === 'interview scheduled') {
    setSelectedApplication({ applicationId, studentId, jobTitle, ... });
    setShowInterviewModal(true);
}
```

**Backend:** `updateApplicationStatus()` verifies the job belongs to the requesting company, then:
```js
application.status = status;
await application.save();
```

---

## Workflow 3: Admin → View Dashboard → Manage Users

### View Stats

**File:** `AdminDashboard.jsx` — on mount, `fetchData('stats')` runs:
```js
const res = await axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
setStats(res.data);  // { students: N, companies: N, pendingCompanies: N, jobs: N }
```

**Backend:** `adminController.js` → `getDashboardStats()`:
```js
const studentCount = await Student.countDocuments();
const companyCount = await Company.countDocuments();
const pendingCompanyCount = await Company.countDocuments({ isVerified: false });
const jobCount = await Job.countDocuments();
res.status(200).json({ students: studentCount, companies: companyCount, pendingCompanies: pendingCompanyCount, jobs: jobCount });
```

### Verify a Company

Admin clicks "Verify" on a pending company:
```js
// AdminDashboard.jsx
await axios.put(`/api/admin/companies/${companyId}/verify`, {}, { headers });
fetchData('companies');  // refresh list
```

**Backend:** `adminController.js` → `verifyCompany()`:
```js
const company = await Company.findByIdAndUpdate(companyId, { isVerified: true }, { new: true });
```

After this, the company can log in.

### Delete a User

```js
// AdminDashboard.jsx
if (!window.confirm("DELETE this student? This is permanent.")) return;
await axios.delete(`/api/admin/students/${studentId}`, { headers });
fetchData('students');
```

**Backend:** `adminController.js` → `deleteStudent()`:
```js
const student = await Student.findByIdAndDelete(studentId);
```

Note: this is a hard delete. Associated applications and interviews are NOT automatically cleaned up (a known limitation).

---

## Workflow 4: File Upload — Resume from Browser to Disk

### Step 1: Student selects a file

**File:** `updateProfile.jsx` → `handleFileChange()`
```js
const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') { setError('Only .pdf files are allowed.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File is too large. Max 5MB allowed.'); return; }
    setSelectedFile(file);
};
```

Frontend validates MIME type and size before any API call.

### Step 2: Student clicks "Upload New Resume"

**File:** `updateProfile.jsx` → `handleResumeUpload()`
```js
const uploadFormData = new FormData();
uploadFormData.append('resume', selectedFile);  // field name must match multer config

const res = await axios.post(
    `/api/student/profile/${studentId}/upload-resume`,
    uploadFormData,
    {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'  // required for file upload
        }
    }
);
setFormData({ ...formData, resumeUrl: res.data.resumeUrl });
```

### Step 3: Multer processes the upload on the backend

**File:** `src/server/Routes/studentRoutes.js`
```js
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));  // absolute path to uploads/
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const studentId = req.params.studentId || req.user.id;
        cb(null, `${studentId}-${uniqueSuffix}${path.extname(file.originalname)}`);
        // Example filename: 64a1f2b3-1704067200000-987654321.pdf
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);  // accept
    else cb(new Error('Only .pdf files are allowed!'), false);  // reject
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
```

### Step 4: Controller saves the URL to the database

**File:** `src/server/Controllers/studentController.js` → `uploadResume()`
```js
const apiUrl = process.env.API_URL || 'http://localhost:3000';
const resumeUrl = `${apiUrl}/uploads/${req.file.filename}`;

const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    { resumeUrl },
    { new: true, runValidators: true }
).select('-password');

res.status(200).json({ message: 'Resume uploaded successfully!', student: updatedStudent, resumeUrl });
```

### Step 5: File is accessible

The file is now at `src/server/uploads/64a1f2b3-1704067200000-987654321.pdf` and accessible via:
```
GET /uploads/64a1f2b3-1704067200000-987654321.pdf
```

This is served by Express:
```js
// server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## Workflow 5: JWT Flow — Login to Authenticated Request

```
1. User logs in
   POST /api/login → 200 { token: "eyJ...", role: "student", ... }

2. Frontend stores token
   localStorage.setItem("token", "eyJ...")

3. User navigates to a protected page (e.g., /dashboard)
   PrivateRoute checks: localStorage.getItem("token") exists → renders page

4. Page mounts, useEffect fires
   const token = localStorage.getItem('token');
   axios.get('/api/student/applications/...', {
       headers: { Authorization: `Bearer eyJ...` }
   });

5. Request arrives at Express
   app.use('/api', applicationRoutes)

6. verifyToken middleware runs
   const authHeader = req.headers.authorization;    // "Bearer eyJ..."
   const token = authHeader.split(' ')[1];           // "eyJ..."
   const decoded = jwt.verify(token, JWT_SECRET);
   // decoded = { id: "64a1...", email: "...", role: "student", iat: ..., exp: ... }
   req.user = decoded;
   next();

7. checkRole('student') runs
   req.user.role === 'student' → next()

8. Controller runs with req.user available
   const studentId = req.params.studentId;
   // Controller can trust studentId because token was verified

9. Response returns to browser
   Axios receives data → React state updated → UI re-renders

10. One hour later — token expires
    User makes another request → jwt.verify() throws TokenExpiredError
    → 403 response → frontend catches it → navigate('/login')
    → User logs in again, gets a fresh token
```
