// src/server/Routes/studentRoutes.js

import express from 'express';
import multer from 'multer'; // <-- NEW IMPORT
import path from 'path'; // <-- NEW IMPORT
const router = express.Router();

import { getStudentProfile, updateStudentProfile, uploadResume } from '../Controllers/studentController.js'; // <-- IMPORT uploadResume
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { StudentProfileUpdateValidation } from '../Middleware/authValidation.js'; 

// --- NEW: Configure Multer for file storage ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/server/uploads/'); // Save files to the 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Create a unique filename: studentId-timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const studentId = req.params.studentId || req.user.id; // Get studentId from token or params
        cb(null, `${studentId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow only PDF files
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});
// --- END MULTER CONFIG ---


// --- Routes for student profile operations ---
// Route to get a specific student's profile
router.get('/student/profile/:studentId', verifyToken, checkRole('student'), getStudentProfile);

// Route to update a specific student's profile
router.put('/student/profile/:studentId', verifyToken, checkRole('student'), StudentProfileUpdateValidation, updateStudentProfile);

// --- NEW ROUTE: For uploading a resume ---
// It uses 'upload.single('resume')' as middleware to process the file
router.post(
    '/student/profile/:studentId/upload-resume', 
    verifyToken, 
    checkRole('student'), 
    upload.single('resume'), // 'resume' must match the FormData key from the frontend
    uploadResume
);
// --- END NEW ROUTE ---

export default router;