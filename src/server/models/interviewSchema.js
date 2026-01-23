import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    applicationId: {
        type: String,
        required: true,
    },
    companyId: {
        type: String,
        required: true,
    },
    studentId: {
        type: String,
        required: true,
    },
   
    jobTitle: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },

    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: false, 
    }
}, {
    timestamps: true, 
});


const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export default Interview;