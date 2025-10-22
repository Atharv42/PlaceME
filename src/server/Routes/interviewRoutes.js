// src/server/Routes/interviewRoutes.js

import express from 'express';
const router = express.Router();

import { scheduleInterview, getStudentInterviews, getCompanyInterviews } from '../Controllers/interviewController.js'; // <-- This line will now work
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { InterviewSchedulingValidation } from '../Middleware/authValidation.js'; // Import new validation

// Route for companies to schedule an interview
router.post('/interviews', verifyToken, checkRole('company'), InterviewSchedulingValidation, scheduleInterview);

// Route to get interviews for a specific student (Student access)
router.get('/student/interviews/:studentId', verifyToken, checkRole('student'), getStudentInterviews);

// --- NEW CODE: Route to get interviews for a specific company (Company access) ---
router.get('/company/interviews/:companyId', verifyToken, checkRole('company'), getCompanyInterviews);
// --- END NEW CODE ---

export default router;