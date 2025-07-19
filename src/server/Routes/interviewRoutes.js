// src/server/Routes/interviewRoutes.js

import express from 'express';
const router = express.Router();

import { scheduleInterview, getStudentInterviews } from '../Controllers/interviewController.js';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';

// Route for companies to schedule an interview
router.post('/interviews', verifyToken, checkRole('company'), scheduleInterview); // Add Joi validation for this later

// --- NEW CODE: Route to get interviews for a specific student (Student access) ---
router.get('/student/interviews/:studentId', verifyToken, checkRole('student'), getStudentInterviews);
// --- END NEW CODE ---

export default router;