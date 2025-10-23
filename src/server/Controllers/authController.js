// src/server/Controllers/authController.js

import Student from '../models/Student.js'; // Ensure path uses lowercase 'm'
import Company from '../models/Company.js'; // Ensure path uses lowercase 'm'
import Admin from '../models/Admin.js';     // Ensure path uses lowercase 'm'
import PasswordResetToken from '../models/PasswordResetToken.js'; // Import new model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // For password reset tokens
import nodemailer from 'nodemailer'; // For sending emails

// --- Nodemailer Setup ---
// Ensure EMAIL_USER and EMAIL_PASS are correctly set in your .env file
// --- End Nodemailer Setup ---

// --- Registration Functions ---

const StudentSignUp = async (req, res) => {
    console.log("Attempting student registration for:", req.body.email); // Debug log
    try {
        const {
            firstName, lastName, email, password, contact,
            address, education, skills, experience,
        } = req.body;

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists with this email' });
        }
        // Optional: Check if contact exists
        const existingContact = await Student.findOne({ contact });
         if (existingContact) {
             return res.status(400).json({ message: 'Student already exists with this contact number' });
         }


        console.log("Hashing password for student..."); // Debug log
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed."); // Debug log

        const newStudent = new Student({
            firstName, lastName, email, password: hashedPassword,
            contact, address, education, skills, experience,
            // resumeUrl is optional
        });

        console.log("Attempting to save student..."); // Debug log
        await newStudent.save();
        console.log("Student saved successfully."); // Debug log

        res.status(201).json({ message: "Student registered successfully" });
    } catch (error) {
        console.error("Student Signup Error:", error); // Log the actual error
        // Check for specific MongoDB duplicate key errors
        if (error.code === 11000) {
             if (error.keyPattern.email) {
                 return res.status(400).json({ message: 'Email already in use.' });
             }
             if (error.keyPattern.contact) {
                 return res.status(400).json({ message: 'Contact number already in use.' });
             }
        }
        res.status(500).json({ message: "Internal server error during registration" });
    }
};

const CompanySignUp = async (req, res) => {
    console.log("Attempting company registration for:", req.body.companyEmail); // Debug log
    try {
        const { companyName, companyEmail, companyPassword } = req.body;

        const existingCompany = await Company.findOne({ companyEmail });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists with this email' });
        }

        console.log("Hashing password for company..."); // Debug log
        const hashedPassword = await bcrypt.hash(companyPassword, 10);
        console.log("Password hashed."); // Debug log

        const newCompany = new Company({
            companyName,
            companyEmail,
            companyPassword: hashedPassword
            // isVerified defaults to false
        });

        console.log("Attempting to save company..."); // Debug log
        await newCompany.save();
        console.log("Company saved successfully."); // Debug log

        res.status(201).json({ message: "Company registered successfully. Awaiting admin verification." });
    } catch (error) {
        console.error("Company Signup Error:", error); // Log the actual error
         if (error.code === 11000 && error.keyPattern.companyEmail) {
             return res.status(400).json({ message: 'Email already in use.' });
         }
        res.status(500).json({ message: "Internal server error during registration" });
    }
};

const AdminSignUp = async (req, res) => {
    console.log("Attempting admin registration for:", req.body.adminEmail); // Debug log
    try {
        const { adminName, adminEmail, adminPassword } = req.body;

        // Basic check to prevent multiple admins easily, enhance as needed
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
             return res.status(403).json({ message: "An admin account already exists." });
        }

        const existingAdmin = await Admin.findOne({ adminEmail });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        console.log("Hashing password for admin..."); // Debug log
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        console.log("Password hashed."); // Debug log

        const newAdmin = new Admin({
            adminName,
            adminEmail,
            adminPassword: hashedPassword
        });

        console.log("Attempting to save admin..."); // Debug log
        await newAdmin.save();
        console.log("Admin saved successfully."); // Debug log

        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        console.error("Admin Signup Error:", error); // Log the actual error
        if (error.code === 11000 && error.keyPattern.adminEmail) {
             return res.status(400).json({ message: 'Email already in use.' });
         }
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- Login Function ---

const Login = async (req, res) => {
    console.log("Login attempt for:", req.body.email); // Debug log
    try {
        const { email, password } = req.body;

        let user;
        let userType;
        let userEmailField = 'email'; // Default

        // 1. Check if Admin
        console.log("Checking Admin collection..."); // Debug log
        user = await Admin.findOne({ adminEmail: email });
        if (user) {
            userType = 'admin';
            userEmailField = 'adminEmail';
            console.log("Found user in Admin collection."); // Debug log
        }

        // 2. Check if Student
        if (!user) {
            console.log("Checking Student collection..."); // Debug log
            user = await Student.findOne({ email });
            if (user) {
                userType = 'student';
                userEmailField = 'email';
                console.log("Found user in Student collection."); // Debug log
            }
        }

        // 3. Check if Company
        if (!user) {
            console.log("Checking Company collection..."); // Debug log
            user = await Company.findOne({ companyEmail: email });
            if (user) {
                userType = 'company';
                userEmailField = 'companyEmail';
                console.log("Found user in Company collection."); // Debug log
            }
        }

        if (!user) {
            console.log("User not found for email:", email); // Debug log
            return res.status(404).json({ message: "User not found" });
        }

        // Get the correct password field based on user type
        let hashed;
        switch(userType) {
            case 'admin': hashed = user.adminPassword; break;
            case 'student': hashed = user.password; break;
            case 'company': hashed = user.companyPassword; break;
            default:
                console.error("Invalid userType determined during login:", userType); // Debug log
                return res.status(500).json({ message: "Internal server error" });
        }

        console.log("Comparing password..."); // Debug log
        const isPasswordValid = await bcrypt.compare(password, hashed);
        if (!isPasswordValid) {
            console.log("Invalid credentials for:", email); // Debug log
            return res.status(401).json({ message: "Invalid credentials" });
        }
        console.log("Password valid."); // Debug log

        // Company Verification Check
        if (userType === 'company' && !user.isVerified) {
            console.log("Company login denied - not verified:", email); // Debug log
            return res.status(403).json({ message: "Company account not verified by admin. Please wait for approval." });
        }

        const tokenPayload = {
            id: user._id,
            email: user[userEmailField], // Use the correct email field
            role: userType
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not defined. Cannot sign token."); // Critical Error Log
            return res.status(500).json({ message: "Internal server configuration error." });
        }

        console.log("Signing JWT token..."); // Debug log
        const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });
        console.log("Token signed successfully for:", userType); // Debug log

        res.status(200).json({
            message: "Login successful",
            token,
            role: userType,
            userId: user._id,
            email: tokenPayload.email // Send email back
        });

    } catch (error) {
        console.error("Login Error:", error); // Log the actual error
        res.status(500).json({ message: "Internal server error during login" });
    }
};

// --- Password Reset Functions ---

const forgotPassword = async (req, res) => {
    console.log("Forgot password request received for:", req.body.email);
    try {
        const { email } = req.body;

        let user;
        let userType;
        let userEmailField = 'email'; // Default

        // Find user across collections... (Code unchanged)
        user = await Student.findOne({ email });
        if (user) userType = 'Student';
        else { /* ... find Company or Admin ... */
            user = await Company.findOne({ companyEmail: email });
             if (user) { userType = 'Company'; userEmailField = 'companyEmail'; }
             else {
                 user = await Admin.findOne({ adminEmail: email });
                 if (user) { userType = 'Admin'; userEmailField = 'adminEmail'; }
             }
        }

        if (!user) {
            console.log("Forgot Password: User not found for email:", email);
            return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
        }
        console.log("User found for password reset:", userType, user._id);

        // Generate token logic... (Code unchanged)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await PasswordResetToken.deleteMany({ userId: user._id });
        await new PasswordResetToken({ userId: user._id, userModel: userType, token: hashedToken, expiresAt }).save();
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // --- Check Variables Again (Inside Function) ---
        console.log("--- Checking Environment Variables before creating transporter ---");
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        console.log("EMAIL_USER (inside function):", emailUser);
        console.log("EMAIL_PASS (inside function):", emailPass ? 'Exists (hidden)' : 'MISSING or undefined');
        console.log("-------------------------------------------------------------");
        // --- End Check ---

        if (!emailUser || !emailPass) {
             console.error("Credentials missing immediately before creating transporter!");
             return res.status(200).json({ message: "An error occurred while attempting to send the reset email (config)." });
        }

        // --- CREATE TRANSPORTER *INSIDE* THE FUNCTION ---
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser, // Use variables checked inside function
                pass: emailPass,
            },
        });
        // --- END TRANSPORTER CREATION ---

        // Send email
        const mailOptions = {
            from: `"PlaceME App" <${emailUser}>`,
            to: user[userEmailField],
            subject: 'PlaceME - Password Reset Request',
            html: `<p>You requested a password reset...</p><a href="${resetUrl}">Reset Password</a>...`, // Simplified HTML
        };

        console.log("Attempting to send password reset email to:", user[userEmailField]);

        // Send the mail using the transporter created above
        await transporter.sendMail(mailOptions);
        // No need for explicit auth here now, as transporter is created with it

        console.log("Email supposedly sent.");

        res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });

    } catch (error) {
        console.error("Forgot Password Error:", error); // Log the actual error
        if (error.code === 'EAUTH' || (error.message && error.message.includes('Missing credentials'))) {
             console.error(">>> CRITICAL: Still getting 'Missing credentials' even when creating transporter inside the function!");
        } else if (error.message && error.message.includes('Invalid login')) {
            console.error(">>> Nodemailer Error: Invalid login credentials (check EMAIL_USER/EMAIL_PASS in .env)");
        }
        res.status(200).json({ message: "An error occurred. If an account exists, an email may have been sent." });
    }
};
const resetPassword = async (req, res) => {
    console.log("Reset password attempt with token:", req.params.token); // Debug log
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
             return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }


        // Hash the token coming from the URL to match the stored one
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        console.log("Finding token in DB..."); // Debug log
        const passwordResetToken = await PasswordResetToken.findOne({
            token: hashedToken,
            expiresAt: { $gt: Date.now() }, // Check if not expired
        });

        if (!passwordResetToken) {
            console.log("Reset token invalid or expired."); // Debug log
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }
        console.log("Token found and valid for user:", passwordResetToken.userId, passwordResetToken.userModel); // Debug log

        // Find the user associated with the token
        let UserCollection;
        let passwordField;
        switch (passwordResetToken.userModel) {
            case 'Student': UserCollection = Student; passwordField = 'password'; break;
            case 'Company': UserCollection = Company; passwordField = 'companyPassword'; break;
            case 'Admin': UserCollection = Admin; passwordField = 'adminPassword'; break;
            default:
                console.error("Invalid userModel found in token:", passwordResetToken.userModel); // Debug log
                return res.status(500).json({ message: "Invalid user type associated with token." });
        }

        const user = await UserCollection.findById(passwordResetToken.userId);
        if (!user) {
            console.log("User for reset token not found:", passwordResetToken.userId); // Debug log
            // Delete the invalid token
            await PasswordResetToken.findByIdAndDelete(passwordResetToken._id);
            return res.status(400).json({ message: "User associated with this token no longer exists." });
        }

        // Hash the new password
        console.log("Hashing new password..."); // Debug log
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        user[passwordField] = hashedPassword;
        console.log("Saving updated user password..."); // Debug log
        await user.save();
        console.log("Password updated."); // Debug log

        // Delete the used token
        console.log("Deleting used reset token..."); // Debug log
        await PasswordResetToken.findByIdAndDelete(passwordResetToken._id);
        console.log("Token deleted."); // Debug log

        res.status(200).json({ message: "Password reset successful! You can now log in with your new password." });

    } catch (error) {
        console.error("Reset Password Error:", error); // Log actual error
        res.status(500).json({ message: "Internal server error during password reset." });
    }
};


export { StudentSignUp, CompanySignUp, AdminSignUp, Login, forgotPassword, resetPassword };