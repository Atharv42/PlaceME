
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
    },
    studentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    appliedDate: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});


const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;