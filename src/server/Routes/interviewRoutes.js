import express from 'express';
const router = express.Router();

import { scheduleInterview, getStudentInterviews, getCompanyInterviews } from '../Controllers/interviewController.js'; 
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { InterviewSchedulingValidation } from '../Middleware/authValidation.js';

router.post('/interviews', verifyToken, checkRole('company'), InterviewSchedulingValidation, scheduleInterview);

router.get('/student/interviews/:studentId', verifyToken, checkRole('student'), getStudentInterviews);

router.get('/company/interviews/:companyId', verifyToken, checkRole('company'), getCompanyInterviews);


export default router;