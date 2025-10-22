// src/server/Controllers/authController.js

import Student from '../models/Student.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const StudentSignUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            contact,
            address,
            education,
            skills,
            experience,
            // resume
        } = req.body;

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            contact,
            address,
            education,
            skills,
            experience,
            // resume
        });

        await newStudent.save();

        res.status(201).json({ message: "Student registered successfully" });
    } catch (error) {
        console.error("Student Signup Error:", error); // Added better logging
        res.status(500).json({ message: "Internal server error" });
    }
};

const CompanySignUp = async (req, res) => {
    try {
        const { companyName, companyEmail, companyPassword } = req.body;

        const existingCompany = await Company.findOne({ companyEmail });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists' });
        }

        const hashedPassword = await bcrypt.hash(companyPassword, 10);

        const newCompany = new Company({
            companyName,
            companyEmail,
            companyPassword: hashedPassword
        });

        await newCompany.save();

        res.status(201).json({ message: "Company registered successfully" });
    } catch (error) {
        console.error("Company Signup Error:", error); // Added better logging
        res.status(500).json({ message: "Internal server error" });
    }
};

// src/server/Controllers/authController.js
// ... (keep all your imports: Student, Company, bcrypt, jwt)
// ... (keep your StudentSignUp and CompanySignUp functions)

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await Student.findOne({ email });
        let userType = 'student';

        if (!user) {
            user = await Company.findOne({ companyEmail: email });
            userType = 'company';
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashed = userType === 'student' ? user.password : user.companyPassword;
        const isPasswordValid = await bcrypt.compare(password, hashed);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const tokenPayload = {
            id: user._id,
            email,
            role: userType
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // If you see this in your server console, the path in server.js is still wrong.
            console.error("JWT_SECRET is not defined. Make sure it's in your .env file and .env is loaded.");
            return res.status(500).json({ message: "Internal server configuration error." });
        }
        
        const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' }); 
        
        console.log(userType);
        res.status(200).json({
            message: "Login successful",
            token,
            role: userType,
            userId: user._id
        });
        
        // alert("Login successful"); // <-- This is correctly removed

    } catch (error) {
        console.error("Login Error:", error); 
        res.status(500).json({ message: "Internal server error" });
    }
};

// Make sure you are exporting all three functions
export { StudentSignUp, CompanySignUp, Login };