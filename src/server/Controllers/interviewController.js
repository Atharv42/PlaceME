import Interview from '../models/interviewSchema.js'; 

const scheduleInterview = async (req, res) => {
    try {
        
        const { 
            applicationId, 
            companyId, 
            studentId, 
            date, 
            time, 
            type, 
            link, 
            jobTitle,   
            companyName 
        } = req.body;

        const newInterview = new Interview({
            applicationId,
            companyId,
            studentId,
            jobTitle,     
            companyName,  
            date,
            time,
            type,
            link: type === 'Virtual' ? link : '' 
        });

        await newInterview.save();
        res.status(201).json({ message: 'Interview scheduled successfully!', interview: newInterview });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Internal server error while scheduling interview.' });
    }
};


const getStudentInterviews = async (req, res) => {
    try {
        const { studentId } = req.params;

        const interviews = await Interview.find({ studentId: studentId }).sort({ date: 1 }); 
        res.status(200).json({ interviews: interviews });
    } catch (error) {
        console.error('Error fetching student interviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching student interviews.' });
    }
};


const getCompanyInterviews = async (req, res) => {
    try {
        const { companyId } = req.params; 

       
        const interviews = await Interview.find({ companyId: companyId }).sort({ date: 1 }); 

       
        const interviewsWithStudentDetails = await Promise.all(interviews.map(async (interview) => {
          
            
            return {
                ...interview._doc, // Get all interview properties
                
            };
        }));


        res.status(200).json({ interviews: interviewsWithStudentDetails });
    } catch (error) {
        console.error('Error fetching company interviews:', error);
        res.status(500).json({ message: 'Internal server error while fetching company interviews.' });
    }
};

export { scheduleInterview, getStudentInterviews, getCompanyInterviews };
