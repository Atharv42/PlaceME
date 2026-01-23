
import express from 'express';
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { CompanyProfileUpdateValidation } from '../Middleware/authValidation.js';
import { getCompanyProfile, updateCompanyProfile } from '../Controllers/companyController.js';

const router = express.Router();

router.get('/company/profile/:companyId', verifyToken, getCompanyProfile);


router.put(
    '/company/profile/:companyId',
    verifyToken,
    checkRole('company'),
    CompanyProfileUpdateValidation,
    updateCompanyProfile
);

export default router;