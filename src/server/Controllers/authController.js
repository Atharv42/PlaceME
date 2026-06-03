import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Admin from '../models/Admin.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const StudentSignUp = async (req, res) => {
    try {
        const {
            firstName, lastName, email, password, contact,
            address, education, skills, experience,
        } = req.body;

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists with this email' });
        }

        const existingContact = await Student.findOne({ contact });
        if (existingContact) {
            return res.status(400).json({ message: 'Student already exists with this contact number' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            firstName, lastName, email, password: hashedPassword,
            contact, address, education, skills, experience,
        });

        await newStudent.save();
        res.status(201).json({ message: "Student registered successfully" });
    } catch (error) {
        console.error("Student Signup Error:", error);
        if (error.code === 11000) {
            if (error.keyPattern?.email) return res.status(400).json({ message: 'Email already in use.' });
            if (error.keyPattern?.contact) return res.status(400).json({ message: 'Contact number already in use.' });
        }
        res.status(500).json({ message: "Internal server error during registration" });
    }
};

const CompanySignUp = async (req, res) => {
    try {
        const { companyName, companyEmail, companyPassword } = req.body;

        const existingCompany = await Company.findOne({ companyEmail });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(companyPassword, 10);

        const newCompany = new Company({
            companyName,
            companyEmail,
            companyPassword: hashedPassword,
        });

        await newCompany.save();
        res.status(201).json({ message: "Company registered successfully. Awaiting admin verification." });
    } catch (error) {
        console.error("Company Signup Error:", error);
        if (error.code === 11000 && error.keyPattern?.companyEmail) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: "Internal server error during registration" });
    }
};

const AdminSignUp = async (req, res) => {
    try {
        const { adminName, adminEmail, adminPassword } = req.body;

        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(403).json({ message: "An admin account already exists." });
        }

        const existingAdmin = await Admin.findOne({ adminEmail });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const newAdmin = new Admin({
            adminName,
            adminEmail,
            adminPassword: hashedPassword,
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        console.error("Admin Signup Error:", error);
        if (error.code === 11000 && error.keyPattern?.adminEmail) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user;
        let userType;
        let userEmailField = 'email';

        user = await Admin.findOne({ adminEmail: email });
        if (user) { userType = 'admin'; userEmailField = 'adminEmail'; }

        if (!user) {
            user = await Student.findOne({ email });
            if (user) { userType = 'student'; userEmailField = 'email'; }
        }

        if (!user) {
            user = await Company.findOne({ companyEmail: email });
            if (user) { userType = 'company'; userEmailField = 'companyEmail'; }
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let hashed;
        switch (userType) {
            case 'admin':   hashed = user.adminPassword;   break;
            case 'student': hashed = user.password;        break;
            case 'company': hashed = user.companyPassword; break;
            default:
                return res.status(500).json({ message: "Internal server error" });
        }

        const isPasswordValid = await bcrypt.compare(password, hashed);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (userType === 'company' && !user.isVerified) {
            return res.status(403).json({ message: "Company account not verified by admin. Please wait for approval." });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not defined.");
            return res.status(500).json({ message: "Internal server configuration error." });
        }

        const tokenPayload = { id: user._id, email: user[userEmailField], role: userType };
        const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            token,
            role: userType,
            userId: user._id,
            email: tokenPayload.email,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error during login" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        let user;
        let userType;
        let userEmailField = 'email';

        user = await Student.findOne({ email });
        if (user) {
            userType = 'Student';
        } else {
            user = await Company.findOne({ companyEmail: email });
            if (user) { userType = 'Company'; userEmailField = 'companyEmail'; }
            else {
                user = await Admin.findOne({ adminEmail: email });
                if (user) { userType = 'Admin'; userEmailField = 'adminEmail'; }
            }
        }

        // Always return a generic 200 to prevent email enumeration
        if (!user) {
            return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await PasswordResetToken.deleteMany({ userId: user._id });
        await new PasswordResetToken({ userId: user._id, userModel: userType, token: hashedToken, expiresAt }).save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (!emailUser || !emailPass) {
            console.error("EMAIL_USER or EMAIL_PASS are not set — cannot send reset email.");
            return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: emailUser, pass: emailPass },
        });

        await transporter.sendMail({
            from: `"PlaceME" <${emailUser}>`,
            to: user[userEmailField],
            subject: 'PlaceME — Password Reset Request',
            html: `
                <p>You requested a password reset for your PlaceME account.</p>
                <p><a href="${resetUrl}">Click here to reset your password</a></p>
                <p>This link expires in <strong>15 minutes</strong>. If you did not request this, ignore this email.</p>
            `,
        });

        res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(200).json({ message: "An error occurred. If an account exists, an email may have been sent." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const passwordResetToken = await PasswordResetToken.findOne({
            token: hashedToken,
            expiresAt: { $gt: Date.now() },
        });

        if (!passwordResetToken) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }

        let UserCollection;
        let passwordField;
        switch (passwordResetToken.userModel) {
            case 'Student': UserCollection = Student; passwordField = 'password';        break;
            case 'Company': UserCollection = Company; passwordField = 'companyPassword'; break;
            case 'Admin':   UserCollection = Admin;   passwordField = 'adminPassword';   break;
            default:
                return res.status(500).json({ message: "Invalid user type associated with token." });
        }

        const user = await UserCollection.findById(passwordResetToken.userId);
        if (!user) {
            await PasswordResetToken.findByIdAndDelete(passwordResetToken._id);
            return res.status(400).json({ message: "User associated with this token no longer exists." });
        }

        user[passwordField] = await bcrypt.hash(password, 10);
        await user.save();
        await PasswordResetToken.findByIdAndDelete(passwordResetToken._id);

        res.status(200).json({ message: "Password reset successful! You can now log in with your new password." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Internal server error during password reset." });
    }
};

export { StudentSignUp, CompanySignUp, AdminSignUp, Login, forgotPassword, resetPassword };
