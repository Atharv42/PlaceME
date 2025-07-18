// src/server/Routes/applicationRoutes.js

import express from 'express';
const router = express.Router();

import { getCompanyApplications, applyForJob } from '../Controllers/applicationController.js';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { ApplyJobValidation } from '../Middleware/authValidation.js';


router.get('/company/applications/:companyId', verifyToken, checkRole('company'), getCompanyApplications);

router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob);

export default router;