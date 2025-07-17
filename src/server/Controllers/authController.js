import Student from '../Models/Student.js';
import Company from '../Models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const StudentSignUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, contact, address, education, skills, experience, resume } = req.body;
        // Here you would typically hash the password and save the student to the database
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
            resume
        });
        await newStudent.save();
        res.status(201).json({ message: "Student registered successfully", data: { firstName, lastName, email } });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const CompanySignUp = async (req, res) => {
    try {
        const { companyName, companyEmail, companyPassword } = req.body;
        // Here you would typically hash the password and save the company to the database
        const hashedPassword = await bcrypt.hash(companyPassword, 10);
        const newCompany = new Company({
            companyName,
            companyEmail,
            companyPassword: hashedPassword
        });
        await newCompany.save();
        res.status(201).json({ message: "Company registered successfully", data: { companyName, companyEmail } });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Here you would typically check the credentials against the database
        // For now, we will just return a success message
        res.status(200).json({ message: "Login successful", data: { email } });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export { StudentSignUp, CompanySignUp, Login };