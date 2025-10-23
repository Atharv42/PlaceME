// src/server/Routes/adminRoutes.js
import express from 'express';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import {
    getDashboardStats,
    getAllStudents,
    getAllCompanies,
    getAllJobs,
    verifyCompany,
    deleteStudent,
    deleteCompany,
    deleteJob
} from '../Controllers/adminController.js';

const router = express.Router();

// All routes in this file are protected and require admin role
router.use(verifyToken);
router.use(checkRole('admin'));

// GET routes
router.get('/stats', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/companies', getAllCompanies);
router.get('/jobs', getAllJobs);

// PUT routes (for updates)
router.put('/companies/:companyId/verify', verifyCompany);

// DELETE routes
router.delete('/students/:studentId', deleteStudent);
router.delete('/companies/:companyId', deleteCompany);
router.delete('/jobs/:jobId', deleteJob);

export default router;