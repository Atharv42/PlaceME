import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true,
    },
    title:  {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    skillsRequired: {
        type: [String],
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    postedDate: {
        type: Date,
        required: true,
    },
    company: {
        type: String,
        required: true,
    }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;