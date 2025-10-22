// src/server/Controllers/interviewController.js

import Interview from '../models/interviewSchema.js'; // Import the Interview model
// Removed unused Job and Company imports as data is now saved directly

// --- UPDATED: Function for a company to schedule an interview ---
const scheduleInterview = async (req, res) => {
    try {
        // Validation is now handled by middleware
        const { 
            applicationId, 
            companyId, 
            studentId, 
            date, 
            time, 
            type, 
            link, 
            jobTitle,     // <-- NEW
            companyName   // <-- NEW
        } = req.body;

        const newInterview = new Interview({
            applicationId,
            companyId,
            studentId,
            jobTitle,     // <-- NEW
            companyName,  // <-- NEW
            date,
            time,
            type,
            link: type === 'Virtual' ? link : '' // Only save link if virtual
        });

        await newInterview.save();
        res.status(201).json({ message: 'Interview scheduled successfully!', interview: newInterview });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Internal server error while scheduling interview.' });
    }
};

// --- UPDATED: Function to get interviews for a specific student ---
const getStudentInterviews = async (req, res) => {
    try {
        const { studentId } = req.params; // Get studentId from URL parameters

        // Find all interviews for this student
        // No complex lookups needed anymore, data is self-contained
        const interviews = await Interview.find({ studentId: studentId }).sort({ date: 1 }); // Sort by date

        res.status(200).json({ interviews: interviews });
    } catch (error) {
        console.error('Error fetching student interviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching student interviews.' });
    }
};
// --- END UPDATED ---

// --- NEW CODE: Function to get interviews for a specific company ---
const getCompanyInterviews = async (req, res) => {
    try {
        const { companyId } = req.params; // Get companyId from URL parameters

        // Find all interviews scheduled by this company
        const interviews = await Interview.find({ companyId: companyId }).sort({ date: 1 }); // Sort by date

        // Add student details (name) for company dashboard display
        // This requires an additional lookup, but is valuable for the UI
        const interviewsWithStudentDetails = await Promise.all(interviews.map(async (interview) => {
            // You'll need to import the Student model for this
            // import Student from '../models/Student.js'; (Add this at the top)
            // const student = await Student.findById(interview.studentId).select('firstName lastName');
            
            return {
                ...interview._doc, // Get all interview properties
                // studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'
                // For now, let's skip the student name to avoid another import error
                // You can add this optimization later
            };
        }));


        res.status(200).json({ interviews: interviewsWithStudentDetails });
    } catch (error) {
        console.error('Error fetching company interviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching company interviews.' });
    }
};
// --- END NEW CODE ---


// --- THIS IS THE FIX ---
export { scheduleInterview, getStudentInterviews, getCompanyInterviews };
// --- END THE FIX ---