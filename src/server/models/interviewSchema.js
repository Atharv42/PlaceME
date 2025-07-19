// src/server/models/interviewSchema.js
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

// Check if the model already exists before compiling
const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export default Interview;