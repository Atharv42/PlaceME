# 06 — Frontend

## Every Page and Component

### Public Pages (no auth required)

| File | Route | What It Renders | API Calls | State Managed |
|---|---|---|---|---|
| `home.jsx` | `/` | Landing page: hero, 3 feature cards, CTA, footer | None | None |
| `login.jsx` | `/login` | Email + password form | `POST /api/login` | `email`, `password`, `error`, `successMessage` |
| `register.jsx` | `/register` | Role selector: Student or Company buttons | None | None |
| `studentRegister.jsx` | `/student` | 10-field student registration form | `POST /api/student-register` | `formData` (10 fields), `error`, `isSubmitting` |
| `companyRegister.jsx` | `/company` | 4-field company registration form | `POST /api/company-register` | `formData`, `error`, `isSubmitting` |
| `AdminRegister.jsx` | `/admin-register` | Admin registration form | `POST /api/admin-register` | `formData`, `error`, `isSubmitting` |
| `ForgotPassword.jsx` | `/forgot-password` | Email input, sends reset link | `POST /api/forgot-password` | `email`, `message`, `error`, `loading` |
| `ResetPassword.jsx` | `/reset-password/:token` | New password + confirm form | `POST /api/reset-password/:token` | `password`, `confirmPassword`, `message`, `error`, `loading` |
| `NotFound.jsx` | `*` | 404 message + link home | None | None |

---

### Student Pages (auth required, role: 'student')

| File | Route | What It Renders | API Calls | State Managed |
|---|---|---|---|---|
| `dashboard.jsx` | `/dashboard` | Stats (total applied, shortlisted, interviews), recent apps, quick action buttons | GET applications, GET interviews | `applications`, `interviews`, counts, `loading`, `error` |
| `browseJobs.jsx` | `/dashboard/newJobs` | Search bar + job list with Apply buttons | GET /api/jobs (with search params), GET /api/student/applications/:id, POST /api/apply-job | `jobs`, `appliedJobIds` (Set), `filters`, `loading`, `error`, `successMessage` |
| `updateProfile.jsx` | `/dashboard/updateprofile` | Profile edit form + resume upload section | GET profile, PUT profile, POST upload-resume | `formData`, `selectedFile`, `uploading`, `loading`, `error`, `successMessage` |
| `viewResume.jsx` | `/dashboard/resume` | Formatted profile view + PDF download button | GET /api/student/profile/:id | `student`, `loading`, `error` |
| `ViewAllApplications.jsx` | `/dashboard/applications` | Full application history list | GET /api/student/applications/:id | `applications`, `loading`, `error` |

---

### Company Pages (auth required, role: 'company')

| File | Route | What It Renders | API Calls | State Managed |
|---|---|---|---|---|
| `CompanyDashboard.jsx` | `/company-dashboard` | Post job form, job list, application list, interview list | GET jobs, GET applications, GET interviews, POST job | `jobs`, `applications`, `interviews`, `newJob`, modals state, `loading`, `error` |
| `ViewApplicants.jsx` | `/jobs/:jobId/applicants` | Applicant list for one job with status update button | GET /api/jobs/:jobId/applications, PUT status | `applications`, `jobTitle`, `loading`, `error` |
| `EditJob.jsx` | `/jobs/:jobId/edit` | Pre-filled edit form for one job | GET /api/jobs/:jobId, PUT /api/jobs/:jobId | `jobData`, `loading`, `isSubmitting`, `error` |
| `EditCompanyProfile.jsx` | `/edit-company-profile` | Company profile edit (website, description, logo URL) | GET profile, PUT profile | `formData`, `loading`, `isSubmitting`, `error` |

---

### Shared Pages

| File | Route | Auth | What It Renders |
|---|---|---|---|
| `ViewCompanyProfile.jsx` | `/company-profile/:companyId` | Any logged-in role | Public company profile (logo, name, website, description) |

---

### Components (reusable modals)

| File | Props | What It Does |
|---|---|---|
| `ScheduleInterviewModal.jsx` | `applicationId`, `studentId`, `jobTitle`, `studentName`, `companyId`, `companyName`, `onClose`, `onInterviewScheduled` | Form modal for scheduling interview (date, time, type, link). Calls `POST /api/interviews`. |
| `UpdateStatusModal.jsx` | `application`, `onClose`, `onSave` | Dropdown modal for changing application status. Calls `onSave(newStatus)` in parent — parent makes the API call. |

### Shared Layout

| File | Used By | What It Does |
|---|---|---|
| `header.jsx` | All logged-in pages | Displays PlaceME logo, "Home" and "My Profile" links, and a Logout button. Logout clears localStorage and navigates to `/login`. |

---

## React Router Setup

File: `src/client/main.jsx`

```jsx
const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
    return children;
};
```

**Route groups:**

```
Public routes (no wrapper):
  /                    → Home
  /login               → Login
  /register            → Register (role selector)
  /student             → StudentRegister
  /company             → CompanyRegister
  /admin-register      → AdminRegister
  /forgot-password     → ForgotPassword
  /reset-password/:token → ResetPassword
  *                    → NotFound

Admin routes (PrivateRoute allowedRoles=['admin']):
  /admin-dashboard     → AdminDashboard

Company routes (PrivateRoute allowedRoles=['company']):
  /company-dashboard   → CompanyDashboard
  /jobs/:jobId/applicants → ViewApplicants
  /jobs/:jobId/edit    → EditJob
  /edit-company-profile → EditCompanyProfile

Student routes (PrivateRoute allowedRoles=['student']):
  /dashboard           → Dashboard
  /dashboard/updateprofile → UpdateProfile
  /dashboard/newJobs   → BrowseJobs
  /dashboard/resume    → ViewResume
  /dashboard/applications → ViewAllApplications

Shared authenticated routes (PrivateRoute allowedRoles=['student','company','admin']):
  /company-profile/:companyId → ViewCompanyProfile
```

---

## State Management

PlaceME uses **local component state only** — no Redux, no Context API, no Zustand.

Every page uses React hooks directly:
```js
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [data, setData] = useState([]);

useEffect(() => {
    fetchData();
}, [navigate]);
```

`localStorage` acts as the **global auth store** — it persists across page refreshes and shares data between components:

| Key | What's stored |
|---|---|
| `token` | JWT string sent in every API request header |
| `role` | `student` / `company` / `admin` — controls routing and UI |
| `userId` | MongoDB `_id` of the logged-in user |
| `email` | Used as display name in the header |

This is a pragmatic choice for a project of this scope. See `docs/10_improvements.md` for how React Context would improve this.

---

## Axios Configuration

There is no centralized Axios instance or interceptor in this project. Each component imports Axios directly and constructs headers manually:

```js
// Pattern used in every page
const token = localStorage.getItem('token');
const res = await axios.get(`/api/student/profile/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
```

The base URL is empty (`/api/...`) — Vite's dev proxy forwards these to `http://localhost:3000`:

```js
// vite.config.js
server: {
    proxy: {
        '/api': 'http://localhost:3000',
        '/uploads': 'http://localhost:3000',
    },
},
```

Error handling pattern used in every component:
```js
} catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);   // show backend message to user
    } else {
        setError('Failed to fetch. Please try again.');  // fallback message
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');  // expired/invalid token → logout
    }
}
```

---

## Role-Based UI

The app does not render a "switch" based on role after login — it routes to completely different pages per role. The role gates happen in three layers:

1. **Login redirect** (`login.jsx`): after login, the user is routed to their role-specific dashboard.
2. **PrivateRoute** (`main.jsx`): wraps every dashboard route with `allowedRoles` check.
3. **Per-page check** (every dashboard page): reads `role` from localStorage at load time; redirects if wrong role.

```js
// Example in dashboard.jsx
const role = localStorage.getItem('role');
if (!token || role !== 'student') {
    navigate('/login');
    return;
}
```

This triple-layering ensures no role can accidentally access another role's pages.

---

## Component Hierarchy (Tree)

```
main.jsx (BrowserRouter + Routes)
│
├── Home.jsx (public)
├── Login.jsx (public)
├── Register.jsx (public)
├── StudentRegister.jsx (public)
├── CompanyRegister.jsx (public)
├── AdminRegister.jsx (public)
├── ForgotPassword.jsx (public)
├── ResetPassword.jsx (public)
├── NotFound.jsx (public, 404)
│
├── PrivateRoute [admin]
│   └── AdminDashboard.jsx
│       └── Header.jsx
│
├── PrivateRoute [company]
│   ├── CompanyDashboard.jsx
│   │   ├── Header.jsx
│   │   ├── ScheduleInterviewModal.jsx (conditionally rendered)
│   │   └── UpdateStatusModal.jsx (conditionally rendered)
│   ├── ViewApplicants.jsx
│   │   └── Header.jsx
│   ├── EditJob.jsx
│   │   └── Header.jsx
│   └── EditCompanyProfile.jsx
│       └── Header.jsx
│
├── PrivateRoute [student]
│   ├── Dashboard.jsx
│   │   └── Header.jsx
│   ├── BrowseJobs.jsx
│   │   └── Header.jsx
│   ├── UpdateProfile.jsx
│   │   └── Header.jsx
│   ├── ViewResume.jsx
│   │   └── Header.jsx
│   └── ViewAllApplications.jsx
│       └── Header.jsx
│
└── PrivateRoute [student + company + admin]
    └── ViewCompanyProfile.jsx
        └── Header.jsx
```
