import Student from '../Models/Student.js';
import Company from '../Models/Company.js';
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
            resume
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
            resume
        });

        await newStudent.save();

        res.status(201).json({ message: "Student registered successfully" });
    } catch (error) {
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
        res.status(500).json({ message: "Internal server error" });
    }
};

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

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'REDACTED_ROTATE_JWT_SECRET', { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            token,
            role: userType,
            userId: user._id
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export { StudentSignUp, CompanySignUp, Login };
