import express from 'express';
import multer from 'multer';
import path from 'path'; 
const router = express.Router();

import { getStudentProfile, updateStudentProfile, uploadResume } from '../Controllers/studentController.js'; 
import { verifyToken, checkRole } from '../Middleware/authMiddleware.js';
import { StudentProfileUpdateValidation } from '../Middleware/authValidation.js'; 


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/server/uploads/'); 
    },
    filename: function (req, file, cb) {
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const studentId = req.params.studentId || req.user.id; 
        cb(null, `${studentId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});




router.get('/student/profile/:studentId', verifyToken, checkRole('student'), getStudentProfile);


router.put('/student/profile/:studentId', verifyToken, checkRole('student'), StudentProfileUpdateValidation, updateStudentProfile);

router.post(
    '/student/profile/:studentId/upload-resume', 
    verifyToken, 
    checkRole('student'), 
    upload.single('resume'),
    uploadResume
);


export default router;