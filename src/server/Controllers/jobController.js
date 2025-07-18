
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

// You will add more functions here later for fetching jobs, updating jobs, deleting jobs

export { postJob };