// src/server/Routes/companyRoutes.js
import express from 'express';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { CompanyProfileUpdateValidation } from '../Middleware/authValidation.js';
import { getCompanyProfile, updateCompanyProfile } from '../Controllers/companyController.js';

const router = express.Router();

// GET Company Profile (Publicly accessible after login, or specific roles)
// Let's restrict it to logged-in users for now
router.get('/company/profile/:companyId', verifyToken, getCompanyProfile);

// PUT Update Company Profile (Only by the company itself)
router.put(
    '/company/profile/:companyId',
    verifyToken,
    checkRole('company'),
    CompanyProfileUpdateValidation,
    updateCompanyProfile
);

export default router;