
import Application from '../models/applicationSchema.js';
import Company from '../Models/Company.js';
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
            return res.status(404).json({ message: 'No jobs found for this company.' });
        }

        res.status(200).json({jobs});
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error while fetching jobs.' });
    }
};


const getAllJobs = async (req, res) => {
    try{
        const jobs = await Job.find();
        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found.' });
        }
        res.status(200).json({jobs});
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error while fetching jobs.' });
    }
};
// You will add more functions here later for fetching jobs, updating jobs, deleting jobs

export { postJob, getCompanyJobs, getAllJobs };