// src/server/models/jobSchema.js
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

// Check if the model already exists before compiling
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;