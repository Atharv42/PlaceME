import express from 'express';
const router = express.Router();

import { 
    getCompanyApplications, 
    applyForJob, 
    getStudentApplications,
    updateApplicationStatus, 
    getApplicationsForJob 
} from '../Controllers/applicationController.js'; 
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { ApplyJobValidation, UpdateStatusValidation } from '../Middleware/authValidation.js'; 

router.get('/company/applications/:companyId', verifyToken, checkRole('company'), getCompanyApplications);


router.get('/jobs/:jobId/applications', verifyToken, checkRole('company'), getApplicationsForJob);

router.post('/apply-job', verifyToken, checkRole('student'), ApplyJobValidation, applyForJob);


router.get('/student/applications/:studentId', verifyToken, checkRole('student'), getStudentApplications);

router.put(
    '/applications/:applicationId/status', 
    verifyToken, 
    checkRole('company'), 
    UpdateStatusValidation, 
    updateApplicationStatus
);

export default router;