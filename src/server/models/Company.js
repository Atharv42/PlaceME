// src/server/models/Company.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true,
    },
    companyPassword: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    // --- NEW PROFILE FIELDS ---
    website: {
        type: String,
        trim: true, // Remove leading/trailing whitespace
        default: '', // Default to empty string
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    logoUrl: { // We'll handle logo *uploads* later, start with URL
        type: String,
        trim: true,
        default: '',
    },
    // --- END NEW FIELDS ---
}, {
    timestamps: true,
});

// Check if the model already exists before compiling
const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;