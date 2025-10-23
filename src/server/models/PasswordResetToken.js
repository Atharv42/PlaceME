// src/server/models/PasswordResetToken.js
import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Link to the user (_id)
        required: true,
        refPath: 'userModel' // Dynamic reference based on userModel field
    },
    userModel: { // Which collection does userId refer to? 'Student', 'Company', or 'Admin'
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
        // Automatically delete the token document after the expiration time
        // index: { expires: '15m' } // You can set TTL index in MongoDB directly
    },
}, {
    timestamps: true // Adds createdAt
});

// Create TTL index manually in MongoDB shell or Compass for expiresAt field if needed
// db.passwordresettokens.createIndex( { "expiresAt": 1 }, { expireAfterSeconds: 0 } )

const PasswordResetToken = mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;