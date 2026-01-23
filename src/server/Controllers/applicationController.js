
import Application from '../models/applicationSchema.js'; 
import Job from '../models/jobSchema.js'; 
import Student from '../models/Student.js'; 


const getCompanyApplications = async (req, res) => {
    try {
        const { companyId } = req.params; 

       
        const companyJobs = await Job.find({ companyId: companyId });
        const jobIds = companyJobs.map(job => job._id.toString()); 

       
        const applications = await Application.find({ jobId: { $in: jobIds } });

       
        const applicationsWithStudentDetails = await Promise.all(applications.map(async (app) => {
            const student = await Student.findById(app.studentId);
            const jobTitle = companyJobs.find(job => job._id.toString() === app.jobId)?.title;

            return {
                _id: app._id,
                jobId: app.jobId,
                studentId: app.studentId,
                status: app.status,
                appliedDate: app.appliedDate,
               
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
            status: 'Applied',
            appliedDate: new Date(),
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Internal server error while submitting application.' });
    }
};


const getStudentApplications = async (req, res) => {
    try {
        const { studentId } = req.params; 

        const applications = await Application.find({ studentId: studentId });

       
        const applicationsWithJobDetails = await Promise.all(applications.map(async (app) => {
            const job = await Job.findById(app.jobId);

            return {
                _id: app._id,
                jobId: app.jobId,
                studentId: app.studentId,
                status: app.status,
                appliedDate: app.appliedDate,
                
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

const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body; // Validated by middleware
        const { id: companyId, role } = req.user; // Get companyId from token

        // Find the application
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        
        const job = await Job.findById(application.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Associated job not found.' });
        }
        if (job.companyId !== companyId) {
            return res.status(403).json({ message: 'Access denied. You do not own this job posting.' });
        }

        // Update the status
        application.status = status;
        await application.save();

        res.status(200).json({ message: 'Application status updated successfully!', application: application });

    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Internal server error while updating status.' });
    }
};
const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { id: companyId } = req.user; // Get companyId from token

        
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }
        if (job.companyId !== companyId) {
            return res.status(403).json({ message: 'Access denied. You do not own this job.' });
        }

        // Find applications for this job
        const applications = await Application.find({ jobId: jobId });

        
        const applicationsWithDetails = await Promise.all(applications.map(async (app) => {
            const student = await Student.findById(app.studentId).select('-password'); 
            if (!student) return null; 

            return {
                _id: app._id,
                jobId: app.jobId,
                studentId: app.studentId,
                status: app.status,
                appliedDate: app.appliedDate,
                studentName: `${student.firstName} ${student.lastName}`,
                studentEmail: student.email,
                studentContact: student.contact,
                studentResumeUrl: student.resumeUrl,
                jobTitle: job.title 
            };
        }));
        
    
        const validApplications = applicationsWithDetails.filter(app => app !== null);

        res.status(200).json({ applications: validApplications, jobTitle: job.title });
    } catch (error) {
        console.error('Error fetching applications for job:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


export { 
    getCompanyApplications, 
    applyForJob, 
    getStudentApplications,
    updateApplicationStatus,
    getApplicationsForJob 
};