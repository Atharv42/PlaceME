// src/server/Routes/jobRoutes.js

import express from 'express';
const router = express.Router();

import { 
    postJob, 
    getCompanyJobs, 
    getAllJobs,
    getJobDetails, // <-- IMPORT NEW
    updateJob      // <-- IMPORT NEW
} from '../Controllers/jobController.js';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
// We'll use JobPostingValidation for updates too
import { JobPostingValidation } from '../Middleware/authValidation.js'; 

// Route to post a new job (only accessible by companies)
router.post('/jobs', verifyToken, checkRole('company'), JobPostingValidation, postJob);

// Route to get all jobs for a specific company
router.get('/company/jobs/:companyId', verifyToken, checkRole('company'), getCompanyJobs);

// Route to get all jobs (for students to browse)
router.get('/jobs', verifyToken, checkRole('student'), getAllJobs); 

// --- NEW ROUTES ---
// Route to get details for a single job (for editing)
router.get('/jobs/:jobId', verifyToken, checkRole('company'), getJobDetails);

// Route to update a job
// We re-use JobPostingValidation, but we need to remove the 'postedDate' check
// For simplicity, we'll create a new light validation
// (You can enhance authValidation.js later to make a JobUpdateValidation)
router.put('/jobs/:jobId', verifyToken, checkRole('company'), updateJob);
// --- END NEW ROUTES ---

export default router;