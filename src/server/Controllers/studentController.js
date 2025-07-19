// src/server/Controllers/studentController.js

import Student from '../Models/Student.js'; // Import the Student model

// --- NEW CODE: Function to get a student's profile ---
const getStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).select('-password'); // Exclude password from the result

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ student });
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Internal server error while fetching student profile.' });
    }
};

// --- NEW CODE: Function to update a student's profile ---
const updateStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body; // Validated by StudentProfileUpdateValidation

        // Find the student and update their profile
        const updatedStudent = await Student.findByIdAndUpdate(studentId, updates, { new: true, runValidators: true }).select('-password');

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', student: updatedStudent });
    } catch (error) {
        console.error('Error updating student profile:', error);
        // Handle potential unique constraint errors (e.g., email, contact)
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ message: 'Email or contact number already in use.' });
        }
        res.status(500).json({ message: 'Internal server error while updating profile.' });
    }
};
// --- END NEW CODE ---

export { getStudentProfile, updateStudentProfile };