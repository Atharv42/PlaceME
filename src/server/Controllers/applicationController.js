// src/server/Controllers/applicationController.js

import Application from '../models/applicationSchema.js'; // Import the Application model
import Job from '../models/jobSchema.js'; // Import the Job model to get job titles
import Student from '../models/Student.js'; // Import the Student model to get student details (if needed, though not directly in this function for self-fetch)

// Function to get applications for a company's jobs
const getCompanyApplications = async (req, res) => {
    try {
        const { companyId } = req.params; // Get companyId from URL parameters

        // 1. Find all jobs posted by this company
        const companyJobs = await Job.find({ companyId: companyId });
        const jobIds = companyJobs.map(job => job._id.toString()); // Get IDs of all jobs

        // 2. Find all applications for these jobs
        const applications = await Application.find({ jobId: { $in: jobIds } });

        // 3. For each application, fetch student details
        const applicationsWithStudentDetails = await Promise.all(applications.map(async (app) => {
            const student = await Student.findById(app.studentId);
            const jobTitle = companyJobs.find(job => job._id.toString() === app.jobId)?.title;

            return {
                _id: app._id,
                jobId: app.jobId,
                studentId: app.studentId,
                status: app.status,
                appliedDate: app.appliedDate,
                // Include student details
                studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                studentEmail: student ? student.email : 'N/A',
                studentContact: student ? student.contact : 'N/A',
                studentResumeUrl: student ? student.resumeUrl : 'N/A',
                jobTitle: jobTitle || 'N/A'
            };
        }));

        res.status(200).json({ applications: applicationsWithStudentDetails });
    } catch (error) {
        console.error('Error fetching company applications:', error);
        res.status(500).json({ message: 'Internal server error while fetching applications.' });
    }
};

// Function for student to apply for a job
const applyForJob = async (req, res) => {
    try {
        const { jobId, studentId } = req.body;

        // Check if the student has already applied for this job
        const existingApplication = await Application.findOne({ jobId, studentId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        // Check if the job exists
        const jobExists = await Job.findById(jobId);
        if (!jobExists) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        const newApplication = new Application({
            jobId,
            studentId,
            status: 'Applied', // Default status for a new application
            appliedDate: new Date(), // Set current date
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Internal server error while submitting application.' });
    }
};

// --- NEW CODE: Function to get applications for a specific student ---
const getStudentApplications = async (req, res) => {
    try {
        const { studentId } = req.params; // Get studentId from URL parameters

        // Find all applications for this student
        const applications = await Application.find({ studentId: studentId });

        // For each application, fetch job details (title, company)
        const applicationsWithJobDetails = await Promise.all(applications.map(async (app) => {
            const job = await Job.findById(app.jobId);

            return {
                _id: app._id,
                jobId: app.jobId,
                studentId: app.studentId,
                status: app.status,
                appliedDate: app.appliedDate,
                // Include job details
                jobTitle: job ? job.title : 'Unknown Job',
                companyName: job ? job.company : 'Unknown Company'
            };
        }));

        res.status(200).json({ applications: applicationsWithJobDetails });
    } catch (error) {
        console.error('Error fetching student applications:', error);
        res.status(500).json({ message: 'Internal server error while fetching student applications.' });
    }
};
// --- END NEW CODE ---


export { getCompanyApplications, applyForJob, getStudentApplications }; // Export new function