// src/server/Routes/studentRoutes.js

import express from 'express';
const router = express.Router();

import { getStudentProfile, updateStudentProfile } from '../Controllers/studentController.js';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { StudentProfileUpdateValidation } from '../Middleware/authValidation.js'; // Import new validation

// --- NEW CODE: Routes for student profile operations ---
// Route to get a specific student's profile
router.get('/student/profile/:studentId', verifyToken, checkRole('student'), getStudentProfile);

// Route to update a specific student's profile
router.put('/student/profile/:studentId', verifyToken, checkRole('student'), StudentProfileUpdateValidation, updateStudentProfile);
// --- END NEW CODE ---

export default router;