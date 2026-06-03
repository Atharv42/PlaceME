# 09 — Setup & Deployment

## Local Development Setup

### Prerequisites
- Node.js v18 or higher (`node --version`)
- npm v9 or higher (`npm --version`)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Atharv42/PlaceME.git
cd PlaceME/PlaceME
```

---

### Step 2: Install Dependencies

All frontend and backend dependencies are in a single `package.json`:

```bash
npm install
```

---

### Step 3: Set Up MongoDB Atlas

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) → Create a free account
2. Create a new project → Build a Cluster → Select the free M0 tier
3. Choose a cloud provider and region → Click "Create Cluster"
4. Once created, click "Connect" → "Connect your application"
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your Atlas credentials
7. Add `/placeme` before the `?` to specify the database name:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/placeme?retryWrites=true&w=majority
   ```
8. In the Atlas UI, go to **Network Access** → Add IP Address → "Allow Access from Anywhere" (for development)
9. Go to **Database Access** → Add a database user with read/write privileges

---

### Step 4: Configure Environment Variables

Create the file `src/server/.env` with the following content:

```env
MongoDB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placeme?retryWrites=true&w=majority&appName=PlaceME
JWT_SECRET=your-long-random-secret-key-here
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=3000
API_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
```

**For EMAIL_PASS:**
1. Go to your Google Account → Security → 2-Step Verification (must be enabled)
2. Go to Security → App Passwords
3. Select app: "Mail", device: "Other" → name it "PlaceME"
4. Copy the 16-character password generated → paste as `EMAIL_PASS`

---

### Step 5: Run the Application

**Both frontend and backend simultaneously (recommended):**
```bash
npm run dev:all
```

**Or in two separate terminals:**

Terminal 1 — Backend (Express, port 3000):
```bash
npm run dev
```

Terminal 2 — Frontend (Vite, port 5173):
```bash
npm run client
```

**Open the app:**
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

---

### Step 6: First-Time Setup in the App

1. Navigate to `http://localhost:5173/admin-register` → Create the admin account (only one can exist)
2. Navigate to `/company` → Register a test company
3. Log in as admin at `/login` → Go to Admin Dashboard → Verify the company
4. Navigate to `/student` → Register a student account
5. Log in as the company → Post a job
6. Log in as the student → Browse jobs → Apply

---

## Deploying the Backend to Render

Render is a free cloud hosting service for Node.js applications.

### Step 1: Prepare for Deployment

Make sure `package.json` has a `start` script that runs the server (not Vite):
```json
"scripts": {
    "start": "node src/server/server.js",
    "dev": "nodemon src/server/server.js"
}
```

Note: The current `start` script runs Vite. For backend deployment, Render needs a separate command. Either modify `start` or use a custom start command in Render.

### Step 2: Push to GitHub

Make sure your code is on GitHub and the `.env` file is in `.gitignore` (it is — checked).

### Step 3: Create a Render Web Service

1. Go to [https://render.com](https://render.com) → Sign up with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** `placeme-api`
   - **Region:** nearest to your users
   - **Branch:** `main`
   - **Root Directory:** `PlaceME` (if your repo has a nested folder)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server/server.js`
   - **Instance Type:** Free

### Step 4: Add Environment Variables

In Render → your service → "Environment" tab, add all variables from your `.env`:
- `MongoDB_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `PORT` → Render sets this automatically; you can leave it out
- `API_URL` → Set to your Render service URL, e.g., `https://placeme-api.onrender.com`
- `CLIENT_URL` → Set to your Vercel frontend URL (see next section)

### Step 5: Update CORS for Production

In `server.js`, replace `app.use(cors())` with:
```js
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
```

### Step 6: Deploy

Click "Create Web Service". Render will install dependencies and start the server. Check the logs for:
```
Server started on http://localhost:10000
Database connected successfully cluster0.xxxxx.mongodb.net
```

Your API is now live at `https://placeme-api.onrender.com`.

---

## Deploying the Frontend to Vercel

### Step 1: Create a Vercel Account

Go to [https://vercel.com](https://vercel.com) → Sign up with GitHub.

### Step 2: Update Frontend API URL

For production, the Vite proxy only works in development. For deployment, add a `.env.production` file (never commit secrets, but the API URL is not a secret):

```env
VITE_API_URL=https://placeme-api.onrender.com
```

Update every API call to use this env var, or use a single axios instance:
```js
// src/client/api.js
import axios from 'axios';
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});
```

### Step 3: Deploy to Vercel

1. In Vercel → Click "Add New Project"
2. Import your GitHub repository
3. Set the **Root Directory** to `PlaceME` (your project folder)
4. **Framework Preset:** Vite (auto-detected)
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. Add environment variable: `VITE_API_URL` = your Render URL

Click Deploy. Vercel builds `npm run build` (Vite bundles React to `dist/`) and serves the static files.

Your frontend is now live at `https://placeme.vercel.app`.

---

## Common Errors and Fixes

### ❌ "MongoServerError: bad auth: Authentication failed"
**Cause:** Wrong MongoDB username or password in `MongoDB_URI`.
**Fix:** Go to MongoDB Atlas → Database Access → reset the user's password. Update `.env` with the new password.

---

### ❌ "MongoNetworkError: connection timed out"
**Cause:** Your IP address is not in MongoDB Atlas's Network Access allowlist.
**Fix:** Atlas → Network Access → Add IP Address → Add your current IP, or "Allow Access from Anywhere" (0.0.0.0/0) for development.

---

### ❌ "Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS"
**Cause:** Vite proxy is not set up, so the browser blocks cross-origin requests.
**Fix:** Ensure `vite.config.js` has:
```js
server: {
    proxy: {
        '/api': 'http://localhost:3000',
        '/uploads': 'http://localhost:3000',
    },
},
```
Also make sure API calls use `/api/...` not `http://localhost:3000/api/...`.

---

### ❌ "JsonWebTokenError: invalid signature" or "TokenExpiredError"
**Cause:** JWT_SECRET in `.env` doesn't match what was used to sign the token, or the token expired.
**Fix:** Clear localStorage in the browser (`localStorage.clear()`) and log in again. Ensure `JWT_SECRET` is consistent in your `.env`.

---

### ❌ "MulterError: File too large"
**Cause:** Student uploaded a PDF larger than 5MB.
**Fix:** This is expected behavior — the server rejects it and returns an error. The frontend's `handleFileChange` also checks size before upload. If you want to increase the limit, change the `limits.fileSize` in `studentRoutes.js`.

---

### ❌ "Error: Cannot find module './Home.css'"
**Cause:** Home.css file casing mismatch on Linux/Mac (case-sensitive filesystems).
**Fix:** The file is `home.css` (lowercase). Ensure `home.jsx` imports `'./home.css'` not `'./Home.css'`.

---

### ❌ Backend server starts but "Database connected" never prints
**Cause:** `MongoDB_URI` is wrong or not loaded.
**Fix:** Check that your `.env` file is at `src/server/.env` (not the project root). Check `server.js` loads it with:
```js
dotenv.config({ path: path.join(__dirname, '.env') });
```
Print `process.env.MongoDB_URI` temporarily to verify it loaded.

---

### ❌ "An admin account already exists" when trying to register
**Cause:** You already created an admin on this database. Only one is allowed.
**Fix:** This is by design. Log in as the existing admin at `/login`. If you lost the credentials, go to MongoDB Atlas → Browse Collections → `admins` → delete the document, then register again.

---

### ❌ Company gets 403 "Company account not verified" after registration
**Cause:** New companies must be verified by the admin before they can log in.
**Fix:** Log in as admin → Admin Dashboard → Manage Companies → click "Verify" next to the company.
