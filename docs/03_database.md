# 03 — Database

## All Mongoose Models

### 1. Student (`src/server/models/Student.js`)

```js
const registerSchema = new mongoose.Schema({
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },          // bcrypt hash
    contact:    { type: String, required: true, unique: true },
    address:    { type: String, required: true },
    education:  { type: String, required: true },
    skills:     { type: String, required: true },          // comma-separated
    experience: { type: String, required: true },
    resumeUrl:  { type: String, required: false },         // absolute URL to PDF
}, { timestamps: true });
```

| Field | Type | Validation | Notes |
|---|---|---|---|
| `firstName` | String | required | — |
| `lastName` | String | required | — |
| `email` | String | required, unique | Joi: valid email format |
| `password` | String | required | Stored as bcrypt hash |
| `contact` | String | required, unique | Joi: exactly 10 digits |
| `address` | String | required | — |
| `education` | String | required | Free text, e.g. "B.Tech CS, XYZ University" |
| `skills` | String | required | Comma-separated, e.g. "Python, React, SQL" |
| `experience` | String | required | Free text or "Fresher" |
| `resumeUrl` | String | optional | Full URL to uploaded PDF |
| `createdAt` | Date | auto | From `timestamps: true` |
| `updatedAt` | Date | auto | From `timestamps: true` |

---

### 2. Company (`src/server/models/Company.js`)

```js
const companySchema = new mongoose.Schema({
    companyName:     { type: String, required: true },
    companyEmail:    { type: String, required: true, unique: true },
    companyPassword: { type: String, required: true },     // bcrypt hash
    isVerified:      { type: Boolean, default: false },    // admin must flip this
    website:         { type: String, trim: true, default: '' },
    description:     { type: String, trim: true, default: '' },
    logoUrl:         { type: String, trim: true, default: '' },
}, { timestamps: true });
```

| Field | Type | Notes |
|---|---|---|
| `companyName` | String | required |
| `companyEmail` | String | unique; used as login identifier |
| `companyPassword` | String | bcrypt hash |
| `isVerified` | Boolean | defaults false; admin must verify before login is allowed |
| `website` / `description` / `logoUrl` | String | optional profile fields, editable via EditCompanyProfile |

**Key design note:** `isVerified: false` acts as a soft lock. Even if a company registers, `authController.js` checks this flag at login:
```js
if (userType === 'company' && !user.isVerified) {
    return res.status(403).json({ message: "Company account not verified by admin." });
}
```

---

### 3. Admin (`src/server/models/Admin.js`)

```js
const adminSchema = new mongoose.Schema({
    adminName:     { type: String, required: true },
    adminEmail:    { type: String, required: true, unique: true },
    adminPassword: { type: String, required: true },
}, { timestamps: true });
```

Identical structure to Company/Student but simpler. Only one admin account is allowed — enforced in `authController.js`:
```js
const adminCount = await Admin.countDocuments();
if (adminCount > 0) {
    return res.status(403).json({ message: "An admin account already exists." });
}
```

---

### 4. Job (`src/server/models/jobSchema.js`)

```js
const jobSchema = new mongoose.Schema({
    companyId:      { type: String, required: true },    // Company._id as string
    title:          { type: String, required: true },
    description:    { type: String, required: true },
    location:       { type: String, required: true },
    skillsRequired: { type: [String], required: true },  // array of skill strings
    deadline:       { type: Date, required: true },
    postedDate:     { type: Date, required: true },
    company:        { type: String, required: true },    // denormalized company name
});
```

| Field | Notes |
|---|---|
| `companyId` | String (not ObjectId ref) — the company's MongoDB `_id` |
| `skillsRequired` | Array of strings — split from comma-separated input by the frontend |
| `company` | Company name stored directly (denormalized) so job listings don't need a join to show the name |
| `deadline` | Date — Joi validates it must be in the future |

---

### 5. Application (`src/server/models/applicationSchema.js`)

```js
const applicationSchema = new mongoose.Schema({
    jobId:       { type: String, required: true },
    studentId:   { type: String, required: true },
    status:      { type: String, required: true },
    appliedDate: { type: Date, required: true },
}, { timestamps: true });
```

| Field | Notes |
|---|---|
| `jobId` | String reference to Job._id |
| `studentId` | String reference to Student._id |
| `status` | One of: `Applied`, `Shortlisted`, `Interview Scheduled`, `Rejected`, `Hired` |
| `appliedDate` | Set to `new Date()` when student clicks Apply |

The status lifecycle is: `Applied` → `Shortlisted` → `Interview Scheduled` → `Hired` or `Rejected`.

When status is set to `Interview Scheduled`, the `CompanyDashboard.jsx` automatically opens the `ScheduleInterviewModal`.

---

### 6. Interview (`src/server/models/interviewSchema.js`)

```js
const interviewSchema = new mongoose.Schema({
    applicationId: { type: String, required: true },
    companyId:     { type: String, required: true },
    studentId:     { type: String, required: true },
    jobTitle:      { type: String, required: true },    // denormalized
    companyName:   { type: String, required: true },    // denormalized
    date:          { type: Date, required: true },
    time:          { type: String, required: true },    // "HH:mm" format
    type:          { type: String, required: true },    // Virtual | On-site | Phone
    link:          { type: String, required: false },   // meeting URL (Virtual only)
}, { timestamps: true });
```

`jobTitle` and `companyName` are stored directly on the interview so that the student dashboard can display them without joining across collections.

---

### 7. PasswordResetToken (`src/server/models/PasswordResetToken.js`)

```js
const passwordResetTokenSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['Student', 'Company', 'Admin'] },
    token:     { type: String, required: true, unique: true },   // SHA-256 hash
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
```

This model uses **`refPath`** — a Mongoose feature for polymorphic references. `userId` is an ObjectId that could point to a document in any of three collections (Student, Company, Admin), and `userModel` tells Mongoose which collection to look in. The reset token expires in 15 minutes.

---

## Entity-Relationship Diagram (ASCII)

```
┌──────────────┐          ┌──────────────┐
│   Student    │          │    Company   │
│──────────────│          │──────────────│
│ _id          │          │ _id          │
│ firstName    │          │ companyName  │
│ lastName     │          │ companyEmail │
│ email        │          │ companyPass  │
│ password     │          │ isVerified   │
│ contact      │          │ website      │
│ skills       │          │ description  │
│ education    │          │ logoUrl      │
│ resumeUrl    │          └──────┬───────┘
└──────┬───────┘                 │
       │                  posts  │ 1
       │ 1                       ▼  N
       │ applies to       ┌──────────────┐
       │ N                │     Job      │
       ▼                  │──────────────│
┌──────────────┐          │ _id          │
│ Application  │          │ companyId ───┼──── (string FK to Company._id)
│──────────────│          │ title        │
│ _id          │          │ description  │
│ jobId ───────┼──────────│ location     │
│ studentId ───┼──────────│ skills[]     │
│ status       │  N   1   │ deadline     │
│ appliedDate  │          │ company      │ ← denormalized name
└──────┬───────┘          └──────────────┘
       │
       │ 1 (when status = "Interview Scheduled")
       ▼
┌──────────────┐          ┌──────────────────────┐
│  Interview   │          │  PasswordResetToken   │
│──────────────│          │──────────────────────│
│ applicationId│          │ userId (ObjectId)     │
│ companyId    │          │ userModel (enum)      │──▶ Student|Company|Admin
│ studentId    │          │ token (SHA-256 hash)  │
│ jobTitle     │          │ expiresAt             │
│ companyName  │          └──────────────────────┘
│ date         │
│ time         │
│ type         │
│ link         │
└──────────────┘
```

---

## Relationships and How Data is Joined

MongoDB is not a relational database — there are no foreign key constraints or automatic joins. PlaceME handles relationships manually in the controllers.

**Example: `getCompanyApplications` in `applicationController.js`**
```js
// 1. Find all jobs for this company
const companyJobs = await Job.find({ companyId: companyId });
const jobIds = companyJobs.map(job => job._id.toString());

// 2. Find all applications for those jobs
const applications = await Application.find({ jobId: { $in: jobIds } });

// 3. Manually enrich each application with student data
const enriched = await Promise.all(applications.map(async (app) => {
    const student = await Student.findById(app.studentId);
    return {
        ...app._doc,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        studentEmail: student?.email,
        studentContact: student?.contact,
        studentResumeUrl: student?.resumeUrl,
        jobTitle: companyJobs.find(j => j._id.toString() === app.jobId)?.title
    };
}));
```

This is what Mongoose's `populate()` would normally do — but since `jobId` and `studentId` are stored as plain strings (not `ObjectId` refs), `populate()` cannot be used directly here. The enrichment is done manually with `Promise.all`.

---

## Populate() in Mongoose

`populate()` replaces a reference field (stored as an ObjectId) with the actual document from the referenced collection. It's like a SQL JOIN.

**Where it IS used in PlaceME:** Only in `PasswordResetToken` — the `userId` field is a real `mongoose.Schema.Types.ObjectId` with `refPath: 'userModel'`, so `.populate('userId')` would work if needed.

**Why it's NOT used everywhere:** The job/application relationships store IDs as plain Strings rather than ObjectId ref fields. This was an early design choice that made manual enrichment necessary. See `docs/10_improvements.md` for how to fix this.

---

## Why MongoDB Over a Relational Database

| Factor | MongoDB | PostgreSQL |
|---|---|---|
| Schema flexibility | Excellent — different user types have different shapes | Requires separate tables or complex inheritance |
| Development speed | Fast — no migration files | Schema migrations required |
| Hosting | MongoDB Atlas free tier included | Requires a paid managed service for cloud |
| Query simplicity | Good for document lookups | Better for complex joins |
| Data integrity | Application-level (Mongoose validation) | Database-level (foreign keys, constraints) |

For a campus placement system with 3 distinct user types, MongoDB's document model is a good fit. The tradeoffs (no guaranteed referential integrity, manual joins) become noticeable at scale, but for a portfolio project they don't matter.

---

## Indexes

Mongoose automatically creates an index on any field marked `unique: true`:

| Collection | Indexed Fields |
|---|---|
| `students` | `email` (unique), `contact` (unique) |
| `companies` | `companyEmail` (unique) |
| `admins` | `adminEmail` (unique) |
| `passwordresettokens` | `token` (unique) |

MongoDB also automatically creates an index on `_id` for every collection.

No compound indexes or custom indexes have been explicitly defined. At scale, adding an index on `Application.studentId` and `Application.jobId` would significantly speed up the frequent queries on those fields (see `docs/10_improvements.md`).
