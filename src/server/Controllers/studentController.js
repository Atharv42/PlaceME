
import Student from '../models/Student.js'; 
const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).select('-password'); 
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ student });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Internal server error while fetching student profile.' });
    }
};

const updateStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body; 
        const updatedStudent = await Student.findByIdAndUpdate(studentId, updates, { new: true, runValidators: true }).select('-password');

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', student: updatedStudent });
    } catch (error)
    {
        console.error('Error updating student profile:', error);
       
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or contact number already in use.' });
        }
        res.status(500).json({ message: 'Internal server error while updating profile.' });
    }
};

const uploadResume = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

       
        const resumeUrl = `http://localhost:3000/uploads/${req.file.filename}`;

       
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { resumeUrl: resumeUrl },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        
        res.status(200).json({ 
            message: 'Resume uploaded successfully!', 
            student: updatedStudent,
            resumeUrl: resumeUrl 
        });

    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ message: 'Internal server error while uploading resume.' });
    }
};

export { getStudentProfile, updateStudentProfile, uploadResume }; 