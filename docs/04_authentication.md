# 04 — Authentication & Authorization

## Registration Flow (Step by Step)

Using student registration as the example. File: `src/server/Controllers/authController.js` → `StudentSignUp`.

```
1. POST /api/student-register
   Body: { firstName, lastName, email, password, contact, address, education, skills, experience }

2. Joi validation middleware runs first (authValidation.js → StudentSignup)
   - Validates email format, password ≥ 6 chars, contact exactly 10 digits, etc.
   - If invalid → 400 Bad Request with the specific validation error message.
   - If valid → calls next(), request reaches the controller.

3. Controller: StudentSignUp()
   a. Check for duplicate email:
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) return res.status(400).json({ message: 'Student already exists' });

   b. Check for duplicate contact:
      const existingContact = await Student.findOne({ contact });
      if (existingContact) return res.status(400).json({ message: 'Student already exists with this contact' });

   c. Hash the password:
      const hashedPassword = await bcrypt.hash(password, 10);
      // 10 = salt rounds. bcrypt generates a unique salt per hash automatically.

   d. Save to database:
      const newStudent = new Student({ firstName, lastName, email, password: hashedPassword, ... });
      await newStudent.save();

   e. Respond:
      res.status(201).json({ message: "Student registered successfully" });

4. Frontend (studentRegister.jsx) receives 201
   → navigate("/login", { state: { successMessage: "Registration successful!" } })
   → Login page displays the success message from router state.
```

**Key bcrypt detail:** `bcrypt.hash(password, 10)` runs 2^10 = 1024 hashing rounds. The output looks like `$2b$10$...` — the `$10$` encodes the cost factor. The salt is embedded in the hash so you don't store it separately.

---

## Login Flow (Step by Step)

File: `src/server/Controllers/authController.js` → `Login`.

```
1. POST /api/login
   Body: { email, password }

2. Joi validation: valid email, password ≥ 6 chars.

3. Controller: Login()

   a. Find the user across all three collections:
      user = await Admin.findOne({ adminEmail: email });    // check admin first
      if (!user) user = await Student.findOne({ email });   // then student
      if (!user) user = await Company.findOne({ companyEmail: email }); // then company
      if (!user) return res.status(404).json({ message: "User not found" });

   b. Get the right password field:
      switch (userType) {
          case 'admin':   hashed = user.adminPassword;
          case 'student': hashed = user.password;
          case 'company': hashed = user.companyPassword;
      }

   c. Compare passwords:
      const isPasswordValid = await bcrypt.compare(password, hashed);
      // bcrypt.compare() extracts the salt from hashed, re-hashes the input, and compares.
      if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

   d. Company verification gate:
      if (userType === 'company' && !user.isVerified) {
          return res.status(403).json({ message: "Company account not verified by admin." });
      }

   e. Sign the JWT:
      const tokenPayload = { id: user._id, email: user[emailField], role: userType };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

   f. Respond:
      res.status(200).json({ token, role: userType, userId: user._id, email });

4. Frontend (login.jsx) stores the response:
   localStorage.setItem("token", token);
   localStorage.setItem("role", role);
   localStorage.setItem("userId", userId);
   localStorage.setItem("email", email);

5. Navigate based on role:
   if (role === 'student')  navigate("/dashboard");
   if (role === 'company')  navigate("/company-dashboard");
   if (role === 'admin')    navigate("/admin-dashboard");
```

---

## JWT Token Structure

A JWT is three Base64URL-encoded JSON objects separated by dots: `header.payload.signature`

**Header** — identifies the algorithm:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** — the data encoded in the token (readable by anyone who has the token):
```json
{
  "id": "64a1f2b3c4d5e6f7a8b9c0d1",
  "email": "student@example.com",
  "role": "student",
  "iat": 1704067200,
  "exp": 1704070800
}
```

**Signature** — cryptographic proof that the token wasn't tampered with:
```
HMACSHA256(
  Base64URL(header) + "." + Base64URL(payload),
  JWT_SECRET
)
```

`JWT_SECRET` is the private key stored in `src/server/.env`. Anyone can decode the header and payload — but only the server (which has the secret) can verify the signature.

---

## Auth Middleware — Line by Line

File: `src/server/Middleware/authMiddleware.js`

```js
export const verifyToken = (req, res, next) => {
    // 1. Read the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Must be in format "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization failed. No or malformed token." });
    }

    // 3. Extract the token string (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 4. Verify signature AND expiry
        //    - jwt.verify() throws if the token is expired or the signature doesn't match
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Attach the decoded payload to the request object
        //    (controllers can now use req.user.id, req.user.role, etc.)
        req.user = decoded;

        // 6. Pass control to the next middleware or controller
        next();
    } catch (error) {
        // 7. jwt.verify() threw — token is expired, malformed, or signature mismatch
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export const checkRole = (role) => {
    // Returns a middleware function that checks the role
    return (req, res, next) => {
        // req.user was set by verifyToken above
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Access denied. Role mismatch." });
        }
        next();
    };
};
```

**How it's applied to routes:**
```js
// studentRoutes.js
router.get('/student/profile/:studentId', verifyToken, checkRole('student'), getStudentProfile);
//                                        ^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^
//                                        Middleware 1  Middleware 2
```

Both middlewares run before `getStudentProfile`. If either rejects, the controller never runs.

---

## What Happens When a Token Expires or Is Tampered With

**Expired token:** `jwt.verify()` checks the `exp` field in the payload. If the current time is past `exp`, it throws a `TokenExpiredError`. The middleware catches this and returns `403 Invalid or expired token`.

**Tampered token:** If anyone modifies the payload (e.g., changes `role: 'student'` to `role: 'admin'`), the signature won't match the modified content — `jwt.verify()` throws a `JsonWebTokenError`. Same 403 response.

**Frontend response to 403:**
```js
// Every protected page (e.g. dashboard.jsx)
if (err.response && (err.response.status === 401 || err.response.status === 403)) {
    navigate('/login');
}
```

So expired or tampered tokens automatically kick users back to the login screen.

---

## Role-Based Access Control (RBAC)

RBAC is enforced at two layers:

### Layer 1 — Backend route guard
```js
// Only companies can post jobs
router.post('/jobs', verifyToken, checkRole('company'), JobPostingValidation, postJob);

// Only students can apply
router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob);

// Only admins can verify companies
router.put('/companies/:companyId/verify', verifyCompany); // inside adminRoutes (all admin routes get verifyToken + checkRole('admin') via router.use())
```

### Layer 2 — Frontend route guard
In `main.jsx`, a `PrivateRoute` component wraps every protected route:

```js
const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) return <Navigate to="/login" />;  // not logged in → login page

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />;  // wrong role → home page
    }

    return children;
};

// Usage:
<Route path="/company-dashboard"
  element={<PrivateRoute allowedRoles={['company']}><CompanyDashboard /></PrivateRoute>}
/>
```

If a student somehow navigates to `/company-dashboard`, they see the home page. If they forge a token with the wrong role, the backend API call still rejects them with 403.

---

## Security Measures Summary

| Measure | How It's Implemented | File |
|---|---|---|
| Password hashing | `bcrypt.hash(password, 10)` — 10 salt rounds | `authController.js` |
| No plain-text passwords stored | Only the bcrypt hash is saved in the DB | `authController.js` |
| JWT expiry | `{ expiresIn: '1h' }` — tokens expire after 1 hour | `authController.js` |
| JWT secret in env | `process.env.JWT_SECRET` — never in source code | `authMiddleware.js` |
| Input validation | Joi schemas on every auth route before controller runs | `authValidation.js` |
| Duplicate detection | `findOne({ email })` before registration | `authController.js` |
| Company verification gate | `isVerified: false` blocks login until admin approves | `authController.js` |
| Password reset token security | Token is SHA-256 hashed before storage; raw token only in the email URL | `authController.js` |
| Reset token expiry | 15-minute window enforced by `expiresAt: { $gt: Date.now() }` query | `authController.js` |
| Email enumeration prevention | Forgot password always returns `200` with the same message regardless of whether the email exists | `authController.js` |
| Single admin | `Admin.countDocuments()` check prevents a second admin from registering | `authController.js` |
