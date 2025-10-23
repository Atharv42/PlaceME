// src/server/Routes/authRoutes.js

import express from 'express';
const router = express.Router();

import {
    StudentSignUp,
    CompanySignUp,
    AdminSignUp,
    Login,
    forgotPassword, // <-- IMPORT NEW
    resetPassword   // <-- IMPORT NEW
} from '../Controllers/authController.js';

import {
    StudentSignup,
    CompanySignup,
    AdminSignup,
    LoginValidation
    // Add validation for password reset if needed (e.g., password strength)
} from '../Middleware/authValidation.js';

import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';

// --- Auth Routes ---
router.post('/student-register', StudentSignup, StudentSignUp);
router.post('/company-register', CompanySignup, CompanySignUp);
router.post('/admin-register', AdminSignup, AdminSignUp);
router.post('/login', LoginValidation, Login);

// --- Password Reset Routes ---
router.post('/forgot-password', forgotPassword);
// Token is passed as a URL parameter
router.post('/reset-password/:token', resetPassword);
// --- END Password Reset Routes ---


// Protected Example Route (Keep or remove as needed)
router.get('/dashboard', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Protected dashboard accessed!',
        user: req.user
    });
});

export default router;