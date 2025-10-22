// src/server/Controllers/jobController.js

import Application from '../models/applicationSchema.js';
import Company from '../models/Company.js';
import Job from '../models/jobSchema.js';

const postJob = async (req, res) => {
    try {
        const { companyId, title, description, location, skillsRequired, deadline, postedDate, company } = req.body;

        const newJob = new Job({
            companyId,
            title,
            description,
            location,
            skillsRequired,
            deadline,
            postedDate,
            company
        });

        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully!', jobId: newJob._id });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Internal server error while posting job.' });
    }
};

const getCompanyJobs = async(req, res) => {
    try {
        const { companyId } = req.params;

        const jobs = await Job.find({ companyId });

        if (jobs.length === 0) {
            // This is not an error, just no jobs found
            return res.status(200).json({ jobs: [] });
        }

        res.status(200).json({jobs});
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error while fetching jobs.' });
    }
};


const getAllJobs = async (req, res) => {
    try{
        const { search, location } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { skillsRequired: { $regex: search, $options: 'i' } }
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        const jobs = await Job.find(query);
        
        if (jobs.length === 0) {
            return res.status(200).json({ message: 'No jobs found matching your criteria.', jobs: [] });
        }
        
        res.status(200).json({jobs});

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error while fetching jobs.' });
    }
};

// --- NEW FUNCTION: Get a single job's details ---
const getJobDetails = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { id: companyId } = req.user; // Get companyId from token

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Security: Ensure the company fetching this job is the one who posted it
        if (job.companyId !== companyId) {
            return res.status(403).json({ message: 'Access denied. You do not own this job.' });
        }

        res.status(200).json({ job });
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
// --- END NEW FUNCTION ---

// --- NEW FUNCTION: Update a job ---
const updateJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { id: companyId } = req.user;
        const updates = req.body; // Comes from the form

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }

        // Security: Ensure the company updating this job is the owner
        if (job.companyId !== companyId) {
            return res.status(403).json({ message: 'Access denied. You do not own this job.' });
        }

        // Apply updates
        // We set deadline/postedDate from the update body to ensure they are correct
        job.title = updates.title;
        job.description = updates.description;
        job.location = updates.location;
        job.skillsRequired = updates.skillsRequired;
        job.deadline = updates.deadline;

        const updatedJob = await job.save();

        res.status(200).json({ message: 'Job updated successfully!', job: updatedJob });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
// --- END NEW FUNCTION ---


export { 
    postJob, 
    getCompanyJobs, 
    getAllJobs,
    getJobDetails, // <-- EXPORT NEW
    updateJob      // <-- EXPORT NEW
};