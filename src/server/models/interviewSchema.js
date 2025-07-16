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
        required: true,
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Application = mongoose.model('Interview', interviewSchema);
export default Application;