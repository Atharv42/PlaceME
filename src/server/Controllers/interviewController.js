import Interview from '../models/interviewSchema.js'; // Import the Interview model
import Job from '../models/jobSchema.js'; // To get job titles for interviews
import Company from '../Models/Company.js'; // To get company names for interviews

// --- NEW CODE: Function for a company to schedule an interview ---
const scheduleInterview = async (req, res) => {
    try {
        // Validation for interview scheduling should be added in authValidation.js later
        const { applicationId, companyId, studentId, date, time, type, link } = req.body;

        const newInterview = new Interview({
            applicationId,
            companyId,
            studentId,
            date,
            time,
            type,
            link
        });

        await newInterview.save();
        res.status(201).json({ message: 'Interview scheduled successfully!', interview: newInterview });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Internal server error while scheduling interview.' });
    }
};

// --- NEW CODE: Function to get interviews for a specific student ---
const getStudentInterviews = async (req, res) => {
    try {
        const { studentId } = req.params; // Get studentId from URL parameters

        // Find all interviews for this student
        const interviews = await Interview.find({ studentId: studentId });

        // For each interview, fetch job title and company name for display
        const interviewsWithDetails = await Promise.all(interviews.map(async (interview) => {
            // Find the job through the application (assuming a direct link for simplicity or you might store jobId in interviewSchema)
            // If interviewSchema has jobId directly, use that for direct lookup.
            // For now, let's assume you fetch job details via looking up the application.
            // Or a simpler approach, if you want to explicitly pass jobId during interview scheduling
            // For now, assuming jobId is NOT in interviewSchema directly, so we need to get it from the application if needed.
            // Let's modify the interview schema or just fetch job title and company from the provided IDs.

            // Fetch job and company details based on IDs available in interviewSchema
            const company = await Company.findById(interview.companyId);
            // Assuming applicationId can lead us to the job if needed, but for simplicity, let's directly look up.
            // If you need job title, you might need to add jobId to interviewSchema or fetch the application first.
            // For current interviewSchema, we only have companyId.
            // A more robust approach might be to save jobTitle and companyName during interview creation, or add jobId to interviewSchema.

            let jobTitle = 'N/A';
            // OPTIONAL: If you want to link interview to job title, you'd need to fetch the application and then its job
            // const application = await Application.findById(interview.applicationId);
            // if (application) {
            //     const job = await Job.findById(application.jobId);
            //     if (job) jobTitle = job.title;
            // }

            return {
                _id: interview._id,
                applicationId: interview.applicationId,
                companyId: interview.companyId,
                studentId: interview.studentId,
                date: interview.date,
                time: interview.time,
                type: interview.type,
                link: interview.link,
                companyName: company ? company.companyName : 'Unknown Company',
                jobTitle: jobTitle // This will be 'N/A' unless you enhance interview creation or fetch strategy
            };
        }));

        res.status(200).json({ interviews: interviewsWithDetails });
    } catch (error) {
        console.error('Error fetching student interviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching student interviews.' });
    }
};
// --- END NEW CODE ---


export { scheduleInterview, getStudentInterviews };