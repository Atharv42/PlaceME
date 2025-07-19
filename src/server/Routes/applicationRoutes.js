// src/server/Routes/applicationRoutes.js

import express from 'express';
const router = express.Router();

import { getCompanyApplications, applyForJob, getStudentApplications } from '../Controllers/applicationController.js'; // Import new function
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { ApplyJobValidation } from '../Middleware/authValidation.js';

// Route to get applications for a specific company's jobs (Company access)
router.get('/company/applications/:companyId', verifyToken, checkRole('company'), getCompanyApplications);

// Route for student to apply for a job (Student access)
router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob);

// --- NEW CODE: Route to get applications for a specific student (Student access) ---
router.get('/student/applications/:studentId', verifyToken, checkRole('student'), getStudentApplications);
// --- END NEW CODE ---

export default router;