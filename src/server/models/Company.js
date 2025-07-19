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
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Check if the model already exists before compiling
const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;