import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    }, 
    education: {
        type: String,
        required: true,
    },
    skills: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    }, 
    resumeUrl: {
        type: String,
        required: false, 
    }
}, {
    timestamps: true, 
});
const Student = mongoose.models.Student || mongoose.model('Student', registerSchema);

export default Student;