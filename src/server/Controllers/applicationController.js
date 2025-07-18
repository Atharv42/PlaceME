// src/server/Controllers/applicationController.js

import Application from '../models/applicationSchema.js';
import Job from '../models/jobSchema.js'; 
import Student from '../Models/Student.js';

const getCompanyApplications = async (req, res) => {
    try {
        const { companyId } = req.params; // Get companyId from URL parameters

        // 1. Find all jobs posted by this company
        const companyJobs = await Job.find({ companyId: companyId }); //finds all jobs posted by the company
        const jobIds = companyJobs.map(job => job._id.toString()); // Get IDs of all jobs posts

        // 2. Find all applications for these jobs
        const applications = await Application.find({ jobId: { $in: jobIds } }); //find all applications where the jobId field is one of the values in the jobIds array

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

// You will add more functions here later for updating application statuses

export { getCompanyApplications, applyForJob };