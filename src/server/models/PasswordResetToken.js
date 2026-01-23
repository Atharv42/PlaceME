
import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'userModel' 
    },
    userModel: { 
        type: String,
        required: true,
        enum: ['Student', 'Company', 'Admin']
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        
    },
}, {
    timestamps: true 
});


const PasswordResetToken = mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;