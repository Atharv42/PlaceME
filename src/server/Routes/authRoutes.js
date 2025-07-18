import express from 'express';
const router = express.Router();

import {
    StudentSignUp,
    CompanySignUp,
    Login
} from '../Controllers/authController.js';

import {
    StudentSignup,
    CompanySignup,
    LoginValidation
} from '../Middleware/authValidation.js';

import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';

// Routes
router.post('/student-register', StudentSignup, StudentSignUp);
router.post('/company-register', CompanySignup, CompanySignUp);
router.post('/login', LoginValidation, Login);

// Protected Example Route
router.get('/dashboard', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Protected dashboard accessed!',
        user: req.user
    });
});

export default router;
