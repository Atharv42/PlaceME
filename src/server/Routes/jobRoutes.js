import express from 'express';
const router = express.Router();

import { 
    postJob, 
    getCompanyJobs, 
    getAllJobs,
    getJobDetails,
    updateJob     
} from '../Controllers/jobController.js';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';

import { JobPostingValidation } from '../Middleware/authValidation.js'; 


router.post('/jobs', verifyToken, checkRole('company'), JobPostingValidation, postJob);

router.get('/company/jobs/:companyId', verifyToken, checkRole('company'), getCompanyJobs);


router.get('/jobs', verifyToken, checkRole('student'), getAllJobs); 


router.get('/jobs/:jobId', verifyToken, checkRole('company'), getJobDetails);


router.put('/jobs/:jobId', verifyToken, checkRole('company'), updateJob);


export default router;