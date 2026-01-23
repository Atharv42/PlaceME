
import express from 'express';
const router = express.Router();

import {
    StudentSignUp,
    CompanySignUp,
    AdminSignUp,
    Login,
    forgotPassword,
    resetPassword   
} from '../Controllers/authController.js';

import {
    StudentSignup,
    CompanySignup,
    AdminSignup,
    LoginValidation
    
} from '../Middleware/authValidation.js';

import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';


router.post('/student-register', StudentSignup, StudentSignUp);
router.post('/company-register', CompanySignup, CompanySignUp);
router.post('/admin-register', AdminSignup, AdminSignUp);
router.post('/login', LoginValidation, Login);


router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);




router.get('/dashboard', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Protected dashboard accessed!',
        user: req.user
    });
});

export default router;