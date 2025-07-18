// src/server/Routes/jobRoutes.js

import express from 'express';
const router = express.Router();

import { postJob } from '../Controllers/jobController.js';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { JobPostingValidation } from '../Middleware/authValidation.js'; // Import new validation

// Route to post a new job (only accessible by companies)
router.post('/jobs', verifyToken, checkRole('company'), JobPostingValidation, postJob);

export default router;