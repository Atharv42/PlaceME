
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
   
    website: {
        type: String,
        trim: true, 
        default: '', 
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    logoUrl: { 
        type: String,
        trim: true,
        default: '',
    },
   
}, {
    timestamps: true,
});


const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;