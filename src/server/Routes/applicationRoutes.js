// src/server/Routes/applicationRoutes.js

import express from 'express';
const router = express.Router();

import { 
    getCompanyApplications, 
    applyForJob, 
    getStudentApplications,
    updateApplicationStatus, 
    getApplicationsForJob // <-- IMPORT NEW
} from '../Controllers/applicationController.js'; 
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { ApplyJobValidation, UpdateStatusValidation } from '../Middleware/authValidation.js'; 

// Route to get applications for a specific company's jobs (Company access)
router.get('/company/applications/:companyId', verifyToken, checkRole('company'), getCompanyApplications);

// --- NEW ROUTE ---
// Route to get all applications for a *specific job* (Company access)
router.get('/jobs/:jobId/applications', verifyToken, checkRole('company'), getApplicationsForJob);
// --- END NEW ROUTE ---

// Route for student to apply for a job (Student access)
router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob);

// Route to get applications for a specific student (Student access)
router.get('/student/applications/:studentId', verifyToken, checkRole('student'), getStudentApplications);

// Route for a company to update an application's status
router.put(
    '/applications/:applicationId/status', 
    verifyToken, 
    checkRole('company'), 
    UpdateStatusValidation, 
    updateApplicationStatus
);

export default router;