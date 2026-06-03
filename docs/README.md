# PlaceME — Technical Documentation

Comprehensive documentation for the PlaceME campus placement management system. Read these before a technical interview — every answer references real code from the project.

---

## Documents

| File | What's Inside |
|---|---|
| [01 — Project Overview](./01_project_overview.md) | Elevator pitch, problem statement, user roles, full feature list, tech stack table, and annotated folder structure |
| [02 — Architecture](./02_architecture.md) | How frontend/backend/database connect, ASCII system diagram, full request lifecycle (Apply to Job), MVC pattern, why MERN, and how env vars work |
| [03 — Database](./03_database.md) | All 7 Mongoose models with fields/types/validations, ASCII ER diagram, how relationships are handled manually, why MongoDB, and which indexes exist |
| [04 — Authentication](./04_authentication.md) | Step-by-step registration and login flows, JWT token structure, auth middleware line-by-line, expired/tampered token behavior, RBAC, and security measures |
| [05 — API Reference](./05_api_reference.md) | Complete table of every endpoint: method, route, auth, role, middleware, request body, and response — grouped by feature area |
| [06 — Frontend](./06_frontend.md) | Every page and component with API calls and state managed, React Router setup, PrivateRoute logic, localStorage-based auth state, Axios pattern, role-based UI, component hierarchy tree |
| [07 — Key Workflows](./07_key_workflows.md) | Full file-by-file traces for: Student registration→apply, Company post→shortlist, Admin manage users, resume upload flow, JWT lifecycle |
| [08 — Interview Questions](./08_interview_questions.md) | 37 interview questions with detailed answers based on actual code — sections: General/HR, React, Node/Express, MongoDB/Mongoose, Security, System Design |
| [09 — Setup & Deployment](./09_setup_and_deployment.md) | Step-by-step local setup (clone→env→run), MongoDB Atlas setup, deploy backend to Render, deploy frontend to Vercel, common errors and fixes |
| [10 — Improvements](./10_improvements.md) | Features to add next (with implementation hints), known limitations with root causes, what to do differently starting fresh, production-grade checklist |

---

## Quick Reference

**Run locally:**
```bash
npm install
# create src/server/.env (see 09_setup_and_deployment.md)
npm run dev:all
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

**Three roles, three dashboards:**
- Student → `/dashboard`
- Company → `/company-dashboard` (requires admin verification)
- Admin → `/admin-dashboard`

**Key files for each layer:**
- Auth: `src/server/Controllers/authController.js` + `src/server/Middleware/authMiddleware.js`
- Models: `src/server/models/`
- Routes: `src/server/Routes/`
- React pages: `src/client/Pages/`
- Route definitions: `src/client/main.jsx`
